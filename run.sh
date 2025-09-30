#!/bin/bash
set -e

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

# === Create and activate venv ===
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi
source .venv/bin/activate

# === Install dependencies ===
echo "Installing backend dependencies..."
for service in backend/atlas backend/dss backend/document; do
    if [ -f "$service/requirements.txt" ]; then
        pip install -r "$service/requirements.txt"
    fi
done

# === Set environment variables for backends ===
export DATABASE_URL=${DATABASE_URL:-"postgresql://priyank:password@localhost:5432/atlas"}
export PGHOST=${PGHOST:-localhost}
export PGPASSWORD=${PGPASSWORD:-changeme}
export FLASK_ENV=${FLASK_ENV:-development}

# === Start backend services and store PIDs ===
echo "Starting backend services..."
PIDS=()
(cd backend/atlas && python run.py) & PIDS+=($!)
(cd backend/dss && python start_server.py) & PIDS+=($!)
(cd backend/document && python app.py) & PIDS+=($!)

# === Start frontend and store PID ===
echo "Starting frontend..."
(cd frontend/dashboard && npm install && npm run dev) & PIDS+=($!)

echo "All services started. Press Ctrl+C to stop."

# === Wait for all background processes ===
wait