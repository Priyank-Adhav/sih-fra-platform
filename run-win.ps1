# =========================================
# Windows PowerShell script to start services
# =========================================

# --- Function to cleanup background processes on exit ---
function Cleanup {
    Write-Host "`nStopping all services..."
    foreach ($proc in $Global:Processes) {
        if ($proc -and !$proc.HasExited) {
            try {
                $proc.Kill()
                $proc.WaitForExit()
            } catch {}
        }
    }
    Write-Host "All services stopped."
    exit
}

# --- Trap Ctrl+C to call Cleanup ---
$null = Register-EngineEvent PowerShell.Exiting -Action { Cleanup }
$null = Register-EngineEvent ConsoleCancelEventHandler -Action { Cleanup }

# --- Load .env ---
if (Test-Path ".env") {
    Write-Host "Loading environment variables from .env..."
    Get-Content .env | Where-Object {$_ -notmatch '^#'} | ForEach-Object {
        $parts = $_ -split '=', 2
        if ($parts.Count -eq 2) {
            [System.Environment]::SetEnvironmentVariable($parts[0], $parts[1])
        }
    }
}

# --- Start PostgreSQL service (if installed and not running) ---
$PostgresService = (Get-Service *postgres* | Sort-Object -Property Name -Descending | Select-Object -First 1).Name
if ($PostgresService) {
    $pg = Get-Service -Name $PostgresService
    if ($pg.Status -ne 'Running') {
        try {
            Start-Service -Name $PostgresService
            Write-Host "PostgreSQL ($PostgresService) started."
        } catch {
            Write-Host "Cannot start PostgreSQL ($PostgresService). Run PowerShell as Administrator."
        }
    } else {
        Write-Host "PostgreSQL ($PostgresService) is already running."
    }
} else {
    Write-Host "No PostgreSQL service found. Skipping."
}

# --- Create and activate venv ---
if (-Not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv .venv
}

# Activate venv (PowerShell)
. .\.venv\Scripts\Activate.ps1

# --- Install backend dependencies ---
Write-Host "Installing backend dependencies..."
$services = @("backend\atlas", "backend\dss", "backend\document")
foreach ($service in $services) {
    $req = Join-Path $service "requirements.txt"
    if (Test-Path $req) {
        pip install -r $req
    }
}

# --- Start backend services ---
Write-Host "Starting backend services..."
$Global:Processes = @()
$Global:Processes += Start-Process -FilePath "python" -ArgumentList "backend\atlas\run.py" -PassThru
$Global:Processes += Start-Process -FilePath "python" -ArgumentList "backend\dss\start_server.py" -PassThru
$Global:Processes += Start-Process -FilePath "python" -ArgumentList "backend\document\app.py" -PassThru

# --- Start frontend ---
Write-Host "Starting frontend..."
$frontendDir = "frontend\dashboard"

# Install frontend dependencies only if node_modules doesn't exist
if (-Not (Test-Path "$frontendDir\node_modules")) {
    Push-Location $frontendDir
    npm install
    Pop-Location
}

# Start frontend with cmd to handle npm properly on Windows
$Global:Processes += Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory $frontendDir -PassThru

Write-Host "All services started. Press Ctrl+C to stop."

# --- Wait indefinitely ---
while ($true) { Start-Sleep -Seconds 5 }
