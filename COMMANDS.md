# ⚡ Comandos Rápidos - LogiFlow

## 🚀 Inicio y Parada

### Iniciar Todo

```powershell
# Opción 1: Script automático (recomendado)
.\start.ps1

# Opción 2: Manual
docker-compose up -d
cd backend; npm run dev
cd frontend; npm run dev
cd ai-service; python main.py
```

### Detener Todo

```powershell
# Detener Docker
docker-compose down

# Cerrar manualmente las ventanas de terminal
```

---

## 🗄️ Base de Datos

### Ver datos visualmente

```powershell
cd backend
npx prisma studio
# Abre en http://localhost:5555
```

### Resetear base de datos

```powershell
cd backend
npx prisma migrate reset
npm run prisma:seed
```

### Crear nueva migración

```powershell
cd backend
npx prisma migrate dev --name nombre_de_migracion
```

### Regenerar cliente Prisma (después de cambios en schema)

```powershell
cd backend
npx prisma generate
```

---

## 🔧 Backend

### Ver logs en tiempo real

```powershell
cd backend
npm run dev
```

### Crear nuevo controlador

```powershell
cd backend
# Crear archivo: src/controllers/nombre.controller.js
# Crear archivo: src/routes/nombre.routes.js
# Importar en src/server.js
```

### Probar endpoint con PowerShell

```powershell
# GET
Invoke-RestMethod -Uri "http://localhost:3000/api/orders" -Headers @{"Authorization"="Bearer TU_TOKEN"}

# POST
$body = @{ email = "test@test.com"; password = "123456" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

---

## 🎨 Frontend

### Instalar nueva dependencia

```powershell
cd frontend
npm install nombre-paquete
```

### Crear nuevo componente

```powershell
cd frontend\src\components
# Crear archivo: NombreComponente.jsx
```

### Crear nueva página

```powershell
cd frontend\src\pages
# Crear archivo: NombrePagina.jsx
# Agregar ruta en src/App.jsx
```

### Build para producción

```powershell
cd frontend
npm run build
npm run preview  # Ver preview del build
```

---

## 🤖 AI Service

### Iniciar con recarga automática

```powershell
cd ai-service
.\venv\Scripts\activate
uvicorn main:app --reload
```

### Ver documentación Swagger

```
http://localhost:8000/docs
```

### Probar endpoint desde PowerShell

```powershell
$body = @{
    orders = @(
        @{ id = "1"; lat = -34.92; lng = -57.95; address = "Test" }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:8000/optimize-route" -Method POST -Body $body -ContentType "application/json"
```

---

## 🐳 Docker

### Ver contenedores corriendo

```powershell
docker ps
```

### Ver logs de un contenedor

```powershell
docker logs logiflow-db
docker logs -f logiflow-db  # Seguir logs en tiempo real
```

### Entrar a PostgreSQL

```powershell
docker exec -it logiflow-db psql -U logiflow -d logiflow_db
```

### Comandos SQL útiles dentro de PostgreSQL

```sql
-- Ver todas las tablas
\dt

-- Ver estructura de una tabla
\d orders

-- Contar pedidos
SELECT COUNT(*) FROM orders;

-- Ver últimos 5 pedidos
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;

-- Salir
\q
```

### Resetear Docker completamente

```powershell
docker-compose down -v  # -v elimina volúmenes (CUIDADO: borra datos)
docker-compose up -d
```

---

## 📦 Git (Control de versiones)

### Inicializar repositorio

```powershell
git init
git add .
git commit -m "Initial commit: LogiFlow base completa"
```

### Conectar con GitHub

```powershell
git remote add origin https://github.com/tuusuario/logiflow.git
git branch -M main
git push -u origin main
```

### Commit de cambios

```powershell
git add .
git commit -m "Descripción del cambio"
git push
```

### Ver cambios

```powershell
git status
git diff
```

---

## 🧪 Testing

### Backend (cuando implementes tests)

```powershell
cd backend
npm test
npm test -- --coverage  # Con cobertura
```

### Frontend (cuando implementes tests)

```powershell
cd frontend
npm test
```

---

## 🚀 Deploy

### Backend en Railway

```powershell
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Crear proyecto
railway init

# Deploy
railway up

# Ver logs
railway logs
```

### Frontend en Vercel

```powershell
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## 🔍 Debugging

### Ver todos los puertos en uso

```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :5173
netstat -ano | findstr :8000
netstat -ano | findstr :5432
```

### Matar proceso por puerto

```powershell
# Encontrar PID
netstat -ano | findstr :3000

# Matar proceso (reemplaza PID)
taskkill /PID 12345 /F
```

### Limpiar caché de npm

```powershell
cd backend
rm -r node_modules
rm package-lock.json
npm install
```

### Limpiar caché de Vite

```powershell
cd frontend
rm -r node_modules
rm -r dist
npm install
```

---

## 📊 Monitoreo

### Ver uso de recursos Docker

```powershell
docker stats
```

### Ver espacio usado por Docker

```powershell
docker system df
```

### Limpiar Docker (libera espacio)

```powershell
docker system prune -a
```

---

## 🎯 Comandos Útiles Específicos del Proyecto

### Regenerar QR codes de pedidos existentes

```powershell
cd backend
node scripts/regenerate-qr.js  # (crear este script si lo necesitas)
```

### Importar pedidos desde Excel

```powershell
# Usar Postman o:
curl -X POST http://localhost:3000/api/orders/import \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@pedidos.xlsx"
```

### Descargar PDF de un pedido

```powershell
# Desde navegador:
http://localhost:3000/api/orders/ORDER_ID/pdf

# O con PowerShell:
Invoke-WebRequest -Uri "http://localhost:3000/api/orders/ORDER_ID/pdf" `
  -Headers @{"Authorization"="Bearer TOKEN"} `
  -OutFile "pedido.pdf"
```

---

## 🆘 Solución Rápida de Problemas

### Error: "Cannot find module 'prisma'"

```powershell
cd backend
npm install
npx prisma generate
```

### Error: Puerto ya en uso

```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000
# Matar el proceso
taskkill /PID numero /F
```

### Error: CORS en frontend

```powershell
# Verificar que FRONTEND_URL esté correcto en backend/.env
# Debe ser: http://localhost:5173
```

### Error: "venv is not recognized"

```powershell
cd ai-service
python -m venv venv
.\venv\Scripts\activate
```

### Error: Docker no inicia

```powershell
# Reiniciar Docker Desktop
# O desde PowerShell admin:
Restart-Service docker
```

### Base de datos corrupta

```powershell
cd backend
npx prisma migrate reset  # CUIDADO: borra todos los datos
npm run prisma:seed
```

---

## 📱 Desarrollo Móvil (cuando implementes PWA)

### Probar en dispositivo real

```powershell
# Encontrar IP de tu PC
ipconfig
# Buscar IPv4 (ej: 192.168.1.100)

# Iniciar frontend con host
cd frontend
npm run dev -- --host

# Acceder desde móvil:
# http://192.168.1.100:5173
```

---

## 🎨 Formateo de Código

### Instalar Prettier (opcional)

```powershell
cd backend
npm install --save-dev prettier
npx prettier --write "src/**/*.js"

cd frontend
npm install --save-dev prettier
npx prettier --write "src/**/*.{js,jsx}"
```

---

## 📝 Logs y Debugging Avanzado

### Backend con debug mode

```powershell
cd backend
$env:DEBUG="*"
npm run dev
```

### Ver queries SQL de Prisma

```powershell
# En backend/.env agregar:
# DATABASE_URL="...?schema=public&connection_limit=5"
# LOG_LEVEL="query,info,warn,error"
```

---

## ⚡ Atajos de Teclado en VS Code

- `Ctrl + P` - Buscar archivo
- `Ctrl + Shift + P` - Paleta de comandos
- `Ctrl + B` - Toggle sidebar
- `Ctrl + \`` - Abrir terminal
- `Alt + Shift + F` - Formatear código
- `F12` - Ir a definición
- `Ctrl + /` - Comentar línea

---

## 🔗 URLs Importantes (cuando todo está corriendo)

```
Frontend:        http://localhost:5173
Backend API:     http://localhost:3000/health
AI Service:      http://localhost:8000/docs
Prisma Studio:   http://localhost:5555
pgAdmin:         http://localhost:5050
PostgreSQL:      localhost:5432
Redis:           localhost:6379
```

---

## 📚 Comandos Menos Comunes pero Útiles

### Exportar base de datos

```powershell
docker exec logiflow-db pg_dump -U logiflow logiflow_db > backup.sql
```

### Importar base de datos

```powershell
docker exec -i logiflow-db psql -U logiflow logiflow_db < backup.sql
```

### Ver variables de entorno

```powershell
# Backend
cd backend
Get-Content .env

# Frontend
cd frontend
Get-Content .env
```

---

**💡 Tip:** Guarda este archivo para consulta rápida mientras desarrollas.

**⭐ Comandos más usados:**

1. `.\start.ps1` - Iniciar todo
2. `npx prisma studio` - Ver base de datos
3. `npm run dev` - Desarrollo
4. `docker-compose down` - Detener servicios
