# LogiFlow - Script de Inicio Rápido
# Ejecuta este script para iniciar todos los servicios

Write-Host "🚚 ============================================" -ForegroundColor Cyan
Write-Host "   LogiFlow - Inicio de Servicios" -ForegroundColor Cyan
Write-Host "============================================ 🚚" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
Write-Host "🐳 Verificando Docker..." -ForegroundColor Yellow
docker --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker no está instalado o no está corriendo" -ForegroundColor Red
    Write-Host "Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Levantar contenedores
Write-Host "🐳 Iniciando servicios Docker (PostgreSQL, Redis, pgAdmin)..." -ForegroundColor Yellow
docker-compose up -d

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Servicios Docker iniciados" -ForegroundColor Green
Write-Host ""

# Backend
Write-Host "🔧 Iniciando Backend API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Frontend
Write-Host "🎨 Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# AI Service
Write-Host "🤖 Iniciando AI Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ai-service; .\venv\Scripts\activate; python main.py" -WindowStyle Normal

Write-Host ""
Write-Host "🎉 ============================================" -ForegroundColor Green
Write-Host "   LogiFlow está iniciándose..." -ForegroundColor Green
Write-Host "============================================ 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "📝 URLs importantes:" -ForegroundColor Cyan
Write-Host "   • Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   • Backend API: http://localhost:3000" -ForegroundColor White
Write-Host "   • AI Service: http://localhost:8000" -ForegroundColor White
Write-Host "   • pgAdmin: http://localhost:5050" -ForegroundColor White
Write-Host ""
Write-Host "👤 Usuarios de prueba:" -ForegroundColor Cyan
Write-Host "   • Admin: admin@logiflow.com / admin123" -ForegroundColor White
Write-Host "   • Operador: operador@logiflow.com / admin123" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Espera 10-15 segundos para que todos los servicios estén listos..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona cualquier tecla para abrir el navegador..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "✨ ¡Listo! LogiFlow está corriendo." -ForegroundColor Green
Write-Host "Para detener todos los servicios, cierra las ventanas de PowerShell y ejecuta:" -ForegroundColor Yellow
Write-Host "   docker-compose down" -ForegroundColor White
Write-Host ""
