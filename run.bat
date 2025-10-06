@echo off
setlocal enabledelayedexpansion

:: === Load environment variables from .env ===
if exist .env (
    echo Loading environment variables from .env...
    for /f "usebackq tokens=* delims=" %%A in (".env") do (
        echo %%A | findstr /b "#" >nul || set %%A
    )
)

:: === Start PostgreSQL service ===
echo Starting PostgreSQL...
net start postgresql-x64-16 >nul 2>&1

:: === Check if PostgreSQL is running ===
pg_isready -q
if %errorlevel% neq 0 (
    echo PostgreSQL not responding. Verify PATH or service name.
    pause
    exit /b 1
)

:: === Create databases if not exist ===
echo Creating databases if missing...
for %%D in (atlas fra_platform analytics) do (
    psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='%%D';" | findstr 1 >nul
    if errorlevel 1 (
        echo Creating database %%D...
        createdb -U postgres %%D
    )
)

:: === Setup Python virtual environment ===
if not exist .venv (
    echo Creating virtual environment...
    python -m venv .venv
)
call .venv\Scripts\activate.bat

:: === Install backend dependencies ===
echo Installing backend dependencies...
for %%S in (backend\atlas backend\dss backend\document) do (
    if exist "%%S\requirements.txt" (
        pip install -r "%%S\requirements.txt"
    )
)

:: === Start backend services ===
echo Starting backend services...
start "atlas" cmd /k "cd backend\atlas && call ..\..\ .venv\Scripts\activate && python run.py"
start "dss" cmd /k "cd backend\dss && call ..\..\ .venv\Scripts\activate && python start_server.py"
start "document" cmd /k "cd backend\document && call ..\..\ .venv\Scripts\activate && python app.py"

:: === Start frontend ===
echo Starting frontend...
start "frontend" cmd /k "cd frontend\dashboard && npm install && npm run dev"

echo All services started. Close windows or press Ctrl+C in each to stop.
pause
