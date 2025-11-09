# LogiFlow - Setup Inicial
# Ejecuta este script UNA SOLA VEZ después de clonar el repositorio

Write-Host "🚀 ============================================" -ForegroundColor Cyan
Write-Host "   LogiFlow - Setup Inicial" -ForegroundColor Cyan
Write-Host "============================================ 🚀" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "Descarga e instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar Python
Write-Host "🐍 Verificando Python..." -ForegroundColor Yellow
python --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python no está instalado" -ForegroundColor Red
    Write-Host "Descarga e instala Python desde: https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Requisitos verificados" -ForegroundColor Green
Write-Host ""

# Instalar dependencias del backend
Write-Host "🔧 Instalando dependencias del Backend..." -ForegroundColor Yellow
cd backend
npm install

Write-Host ""
Write-Host "🗄️  Configurando base de datos..." -ForegroundColor Yellow
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed

Write-Host ""
Write-Host "✅ Backend configurado" -ForegroundColor Green
cd ..

# Instalar dependencias del frontend
Write-Host ""
Write-Host "🎨 Instalando dependencias del Frontend..." -ForegroundColor Yellow
cd frontend
npm install
Write-Host "✅ Frontend configurado" -ForegroundColor Green
cd ..

# Configurar AI Service
Write-Host ""
Write-Host "🤖 Configurando AI Service (Python)..." -ForegroundColor Yellow
cd ai-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
Write-Host "✅ AI Service configurado" -ForegroundColor Green
cd ..

Write-Host ""
Write-Host "🎉 ============================================" -ForegroundColor Green
Write-Host "   Setup Completado Exitosamente!" -ForegroundColor Green
Write-Host "============================================ 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Ejecuta: .\start.ps1" -ForegroundColor White
Write-Host "   2. Abre: http://localhost:5173" -ForegroundColor White
Write-Host "   3. Login con: admin@logiflow.com / admin123" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación completa en: INSTALL.md" -ForegroundColor Cyan
Write-Host ""
