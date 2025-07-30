@echo off
echo Starting Employee Attendance Management System...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd Backend && npm start"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
