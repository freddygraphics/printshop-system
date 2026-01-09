@echo off
echo ===============================
echo 🚀 Starting PrintShop Full Stack
echo ===============================

:: Cambiar al backend
cd backend

:: Detener procesos antiguos (puerto 3001)
echo 🧹 Cleaning old backend (port 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /PID %%a /F >nul 2>&1

:: Iniciar backend
echo 🟢 Starting backend on port 3001...
start cmd /k "node index.js"

:: Esperar 5 segundos para asegurar inicio del backend
timeout /t 5 >nul

:: Cambiar al frontend
cd ..\frontend

:: Detener procesos antiguos de Next.js
echo 🧹 Cleaning old frontend (port 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F >nul 2>&1

:: Iniciar frontend
echo 🟣 Starting frontend...
start cmd /k "npm run dev"

echo ✅ All systems running! You can open http://localhost:3000
pause
