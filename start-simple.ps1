# LogiFlow - Script de Inicio Simple (Sin Docker)
# Ejecuta este script para iniciar todos los servicios

Write-Host ""
Write-Host "🚚 ============================================" -ForegroundColor Cyan
Write-Host "   LogiFlow - Inicio de Servicios" -ForegroundColor Cyan
Write-Host "============================================ 🚚" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "Por favor instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Node.js $nodeVersion detectado" -ForegroundColor Green
Write-Host ""

# Verificar Python
Write-Host "🔍 Verificando Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python no está instalado" -ForegroundColor Red
    Write-Host "Por favor instala Python desde: https://www.python.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ $pythonVersion detectado" -ForegroundColor Green
Write-Host ""

# Backend
Write-Host "🔧 Iniciando Backend API..." -ForegroundColor Yellow
Write-Host "   Ruta: backend/" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🔧 BACKEND API' -ForegroundColor Blue; cd '$PSScriptRoot\backend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Frontend
Write-Host "🎨 Iniciando Frontend..." -ForegroundColor Yellow
Write-Host "   Ruta: frontend/" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🎨 FRONTEND' -ForegroundColor Magenta; cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# AI Service
Write-Host "🤖 Iniciando AI Service..." -ForegroundColor Yellow
Write-Host "   Ruta: ai-service/" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🤖 AI SERVICE' -ForegroundColor Green; cd '$PSScriptRoot\ai-service'; python main.py" -WindowStyle Normal

Write-Host ""
Write-Host "🎉 ============================================" -ForegroundColor Green
Write-Host "   LogiFlow está iniciándose..." -ForegroundColor Green
Write-Host "============================================ 🎉" -ForegroundColor Green
Write-Host ""

Write-Host "⏳ Esperando 15 segundos para que los servicios inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "📝 URLs importantes:" -ForegroundColor Cyan
Write-Host "   • Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host "   • Backend API: http://localhost:3000" -ForegroundColor White
Write-Host "   • AI Service:  http://localhost:8000" -ForegroundColor White
Write-Host "   • API Docs:    http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "👤 Credenciales de prueba:" -ForegroundColor Cyan
Write-Host "   • Admin:    admin@logiflow.com / admin123" -ForegroundColor White
Write-Host "   • Operador: operator@logiflow.com / operator123" -ForegroundColor White
Write-Host "   • Agente:   driver@logiflow.com / driver123" -ForegroundColor White
Write-Host ""
Write-Host "💡 Presiona cualquier tecla para abrir el navegador..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Abrir navegador
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "✨ ¡LogiFlow está corriendo!" -ForegroundColor Green
Write-Host ""
Write-Host "Para detener los servicios:" -ForegroundColor Yellow
Write-Host "   1. Cierra las 3 ventanas de PowerShell que se abrieron" -ForegroundColor White
Write-Host "   2. O ejecuta: .\stop.ps1" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación: https://github.com/Lisandro1313/LogiFlow" -ForegroundColor Cyan
Write-Host ""
