@echo off
TITLE OD Tasks Launcher
color 0A
echo ========================================================
echo               STARTING OD TASKS PWA
echo ========================================================
cd /d "%~dp5"

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js detected successfully.
echo [INFO] Checking dependencies...

if not exist "node_modules\" (
    echo [INFO] Installing project dependencies (npm install)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
)

echo [INFO] Launching Vite development server...
start /b cmd /c "npm run dev"

echo [INFO] Waiting for server to initialize...
timeout /t 2 /nobreak >nul

echo [INFO] Opening OD Tasks in default web browser...
start http://localhost:5173/

echo ========================================================
echo   OD Tasks is running! Keep this window open.
echo   Press any key to stop the server and exit...
echo ========================================================
pause >nul
