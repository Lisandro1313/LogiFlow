# Detener servicios de LogiFlow

Write-Host "🛑 Deteniendo servicios de LogiFlow..." -ForegroundColor Yellow
Write-Host ""

# Detener Docker
Write-Host "🐳 Deteniendo contenedores Docker..." -ForegroundColor Yellow
docker-compose down

Write-Host ""
Write-Host "✅ Servicios Docker detenidos" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Recuerda cerrar manualmente las ventanas de PowerShell del Backend, Frontend y AI Service" -ForegroundColor Yellow
Write-Host ""
