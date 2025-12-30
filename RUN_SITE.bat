@echo off
echo ========================================
echo   Employee Management System
echo   GOMUKH DIAMOND
echo ========================================
echo.
echo Starting servers...
echo.

echo [1/2] Starting Backend Server (Port 5000)...
start "Backend Server - Port 5000" cmd /k "cd /d %~dp0backend && echo Backend Server Running on http://localhost:5000 && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server (Port 3000)...
start "Frontend Server - Port 3000" cmd /k "cd /d %~dp0frontend && echo Frontend Server Running on http://localhost:3000 && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo   Servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo IMPORTANT: Make sure MongoDB is running!
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak > nul

start http://localhost:3000

echo.
echo Browser opened! Check the server windows for any errors.
echo.
echo Press any key to close this window (servers will keep running)...
pause > nul






