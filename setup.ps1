# Token-Based Appointment System Setup (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Token-Based Appointment System Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Prerequisites Check:" -ForegroundColor Yellow
Write-Host "- Node.js 18+ installed: ✅" -ForegroundColor Green
Write-Host "- PostgreSQL 14+ installed and running" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔧 Step 1: Update Database Configuration" -ForegroundColor Yellow
Write-Host "Please edit backend\.env file and replace 'your_password_here' with your PostgreSQL password" -ForegroundColor Red
Write-Host ""
Pause

Write-Host "🔧 Step 2: Create Database" -ForegroundColor Yellow
Write-Host "Run this command in PostgreSQL (psql or pgAdmin):" -ForegroundColor Cyan
Write-Host "CREATE DATABASE token_appointment_db;" -ForegroundColor White
Write-Host ""
Pause

Write-Host "🔧 Step 3: Setting up Backend..." -ForegroundColor Yellow
Set-Location -Path "backend"

Write-Host "Installing backend dependencies..." -ForegroundColor Gray
npm install

Write-Host "Generating Prisma client..." -ForegroundColor Gray
npx prisma generate

Write-Host "Running database migrations..." -ForegroundColor Gray
npx prisma migrate dev --name init

Write-Host "Seeding database with sample data..." -ForegroundColor Gray
npx prisma db:seed

Set-Location -Path ".."

Write-Host "🎨 Step 4: Setting up Frontend..." -ForegroundColor Yellow
Set-Location -Path "frontend"

Write-Host "Installing frontend dependencies..." -ForegroundColor Gray
npm install

Set-Location -Path ".."

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start the application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Backend (in backend folder):  npm run dev" -ForegroundColor White
Write-Host "2. Frontend (in frontend folder): npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "- Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "- Health:   http://localhost:5000/health" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Login Credentials:" -ForegroundColor Cyan
Write-Host "- Admin:    admin@tokenappointment.com / admin123!@#" -ForegroundColor White
Write-Host "- Doctor:   dr.wilson@example.com / doctor123" -ForegroundColor White
Write-Host "- Patient:  john.doe@example.com / patient123" -ForegroundColor White
Write-Host ""