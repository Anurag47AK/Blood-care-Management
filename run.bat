@echo off
TITLE Blood Care Management System - Startup
COLOR 0C

echo =======================================================
echo  Blood Care Management System - Smart Blood Donation
echo  Full-Stack MERN Project Launcher
echo =======================================================
echo.

set PATH=C:\Program Files\nodejs;C:\Program Files\MongoDB\Server\9.0\bin;%PATH%

:: 1. Check if MongoDB directory exists
if not exist "backend\data" (
    echo [*] Creating backend database directory...
    mkdir "backend\data"
)

:: 2. Check if MongoDB is running, if not start it in background
netstat -ano | findstr 27017 >nul
if %errorlevel% neq 0 (
    echo [*] Starting local MongoDB daemon on port 27017...
    start "MongoDB-Service" /min "C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe" --dbpath "%~dp0backend\data" --port 27017 --bind_ip 127.0.0.1
    timeout /t 3 /nobreak >nul
) else (
    echo [OK] MongoDB is already running on port 27017.
)

:: 3. Seed demonstration data
echo [*] Seeding demonstration database records...
cd /d "%~dp0backend"
call "C:\Program Files\nodejs\node.exe" scripts/seed.js

:: 4. Start Backend Server
echo [*] Launching Express backend API on port 5000...
start "BloodCare-Backend" cmd /k "title BloodCare Backend & cd /d %~dp0backend & node server.js"
timeout /t 2 /nobreak >nul

:: 5. Start Frontend Dev Server
echo [*] Launching Vite frontend server on port 5173...
start "BloodCare-Frontend" cmd /k "title BloodCare Frontend & cd /d %~dp0frontend & npm run dev"
timeout /t 3 /nobreak >nul

:: 6. Launch Web Browser
echo [*] Opening Blood Care Management System in browser...
start http://localhost:5173

echo.
echo =======================================================
echo  APPLICATION IS RUNNING LIVE!
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:5000
echo  Health:   http://localhost:5000/api/health
echo =======================================================
echo.
echo Demonstration Accounts:
echo  Admin:     admin@bloodcare.org          / Admin@123
echo  Donor:     rahul.donor@example.com      / Donor@123
echo  Requester: vikram.requester@example.com / Patient@123
echo =======================================================
echo.
pause
