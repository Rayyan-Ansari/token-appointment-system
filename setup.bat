@echo off
echo ========================================
echo Token-Based Appointment System Setup
echo ========================================
echo.

echo 📋 Prerequisites:
echo - Node.js 18+ installed
echo - PostgreSQL 14+ installed and running
echo - Database 'token_appointment_db' created
echo.

pause

echo.
echo 🔧 Setting up Backend...
cd backend

echo Installing backend dependencies...
call npm install

echo Generating Prisma client...
call npx prisma generate

echo Running database migrations...
call npx prisma migrate dev --name init

echo Seeding database with sample data...
call npx prisma db:seed

echo.
echo 🎨 Setting up Frontend...
cd ..\frontend

echo Installing frontend dependencies...
call npm install

echo.
echo ✅ Setup Complete!
echo.
echo 🚀 To start the application:
echo.
echo 1. Backend (in backend folder):  npm run dev
echo 2. Frontend (in frontend folder): npm run dev
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

pause