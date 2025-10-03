#!/bin/bash
set -e

# === Parse command line arguments ===
QUICK_MODE=false
for arg in "$@"; do
    case $arg in
        --quick)
        QUICK_MODE=true
        shift
        ;;
        *)
        # Unknown option
        ;;
    esac
done

# === Function to cleanup background processes on exit ===
cleanup() {
    echo
    echo "Stopping all services..."
    for pid in "${PIDS[@]}"; do
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid 2>/dev/null
            wait $pid 2>/dev/null || true
        fi
    done
    echo "All services stopped."
    exit 0
}

# Trap multiple signals
trap cleanup EXIT SIGINT SIGTERM SIGTSTP

# === Load .env ===
if [ -f ".env" ]; then
    echo "Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
fi

# === Start PostgreSQL service ===
echo "Starting PostgreSQL..."
sudo systemctl start postgresql

if [ "$QUICK_MODE" = false ]; then
    # === Create and activate venv ===
    if [ ! -d ".venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv .venv
    fi
    source .venv/bin/activate

    # === Install dependencies ===
    echo "Installing backend dependencies..."
    for service in backend/atlas backend/dss backend/document backend/claim_process; do
        if [ -f "$service/requirements.txt" ]; then
            echo "Installing dependencies for $service..."
            pip install -r "$service/requirements.txt"
        fi
    done

    # === Database Setup and Seeding ===
    echo "Checking database setup..."

    # Check if claim_cases table exists
    if ! python -c "
import sys
sys.path.append('backend/claim_process')
from database import engine
from sqlalchemy import inspect
inspector = inspect(engine)
tables = inspector.get_table_names()
print('Existing tables:', tables)
if 'claim_cases' not in tables:
    print('FIRST_TIME_SETUP: Database needs initialization')
    sys.exit(1)
else:
    print('DATABASE_OK: Tables already exist')
    sys.exit(0)
" 2>/dev/null; then
        echo "🚀 First-time setup detected! Initializing database..."
        
        # Run migrations
        echo "Creating database tables..."
        if python -m backend.claim_process.migrations 2>/dev/null; then
            echo "✅ Database tables created successfully!"
        else
            echo "❌ Failed to create database tables"
            exit 1
        fi
        
        # Seed with mock data
        echo "Seeding database with sample data..."
        if python -m backend.claim_process.mock_data 2>/dev/null; then
            echo "✅ Sample data seeded successfully!"
            echo "📊 Created sample FRA claims for testing"
        else
            echo "⚠️  Could not seed sample data (database might already have data)"
        fi
    else
        echo "✅ Database already set up"
    fi
else
    # Quick mode - just activate venv and continue
    echo "🚀 Quick mode - skipping setup steps..."
    source .venv/bin/activate
fi

# === Start backend services and store PIDs ===
echo "Starting backend services..."
PIDS=()

# Atlas Service (Port 5000)
echo "Starting Atlas service on port 5000..."
(cd backend/atlas && python run.py) & PIDS+=($!)

# DSS Service (Port 8000) 
echo "Starting DSS service on port 8000..."
(cd backend/dss && python start_server.py) & PIDS+=($!)

# Document Service (Port 5001)
echo "Starting Document service on port 5001..."
(cd backend/document && python app.py) & PIDS+=($!)

# Claim Process Service (Port 8001)
echo "Starting Claim Process service on port 8001..."
(uvicorn backend.claim_process.app:app --host 0.0.0.0 --port 8001 --reload) & PIDS+=($!)

# Wait a moment for backend services to initialize
sleep 3

# === Start frontend and store PID ===
echo "Starting frontend..."
(cd frontend/dashboard && npm run dev) & PIDS+=($!)

echo ""
echo "===================================================================="
if [ "$QUICK_MODE" = true ]; then
    echo "Services started in QUICK mode!"
else
    echo "All services started successfully!"
fi
echo "===================================================================="
echo "Frontend Dashboard: http://localhost:5173"
echo "API Documentation:"
echo "   - Atlas API:        http://localhost:5000/docs"
echo "   - Document API:     http://localhost:5001/docs"
echo "   - DSS API:          http://localhost:8000/docs"
echo "   - Claim Process:    http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo "===================================================================="

# === Wait for all background processes ===
wait