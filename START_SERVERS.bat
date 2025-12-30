@echo off
echo Starting Employee Management System...
echo.
echo Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
echo.
echo Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
echo.
echo Servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo IMPORTANT: Make sure MongoDB is running!
echo Press any key to exit this window (servers will keep running)...
pause > nul






