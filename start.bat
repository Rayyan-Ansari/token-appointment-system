@echo off
echo ========================================
echo   Token Appointment System - STARTING
echo ========================================
echo.

echo 🚀 Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npx ts-node -r tsconfig-paths/register src/server.ts"

timeout /t 5 > nul

echo 🎨 Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo 🌐 URLs:
echo - Backend:  http://localhost:5000
echo - Frontend: http://localhost:3000
echo - Health:   http://localhost:5000/health
echo.
echo 🔑 Login Credentials:
echo - Admin:    admin@tokenappointment.com / admin123!@#
echo - Doctor:   dr.wilson@example.com / doctor123
echo - Patient:  john.doe@example.com / patient123
echo.
echo 📝 Note: Both servers will open in separate windows
echo Close this window when you're done using the system.
echo.

pause