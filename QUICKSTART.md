# 🚀 Quick Start Guide - LogiFlow

Esta guía te ayudará a tener LogiFlow corriendo en **menos de 10 minutos**.

---

## ⚡ Inicio Rápido (Recomendado)

### Windows

```powershell
# 1. Clonar el repositorio
git clone https://github.com/Lisandro1313/LogiFlow.git
cd LogiFlow

# 2. Ejecutar script automático
.\start-simple.ps1
```

¡Listo! El script hará todo automáticamente y abrirá el navegador.

---

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- ✅ **Node.js** 20+ → [Descargar](https://nodejs.org/)
- ✅ **Python** 3.11+ → [Descargar](https://www.python.org/)
- ✅ **PostgreSQL** 15+ → [Descargar](https://www.postgresql.org/) **(solo si no usas Railway/Render)**
- ✅ **Git** → [Descargar](https://git-scm.com/)

**Verificar instalación:**
```bash
node --version   # debe mostrar v20.x.x o superior
python --version # debe mostrar 3.11.x o superior
psql --version   # debe mostrar 15.x o superior
```

---

## 🛠️ Instalación Manual

Si prefieres hacerlo paso a paso:

### 1️⃣ Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales de PostgreSQL
# DATABASE_URL="postgresql://user:password@localhost:5432/logiflow"

# Generar cliente de Prisma
npx prisma generate

# Crear base de datos y tablas
npx prisma db push

# (Opcional) Cargar datos de prueba
npx prisma db seed

# Iniciar servidor
npm run dev
```

**✅ Backend corriendo en:** `http://localhost:3000`

### 2️⃣ Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# El .env ya viene configurado para desarrollo local

# Iniciar aplicación
npm run dev
```

**✅ Frontend corriendo en:** `http://localhost:5173`

### 3️⃣ AI Service

```bash
cd ai-service

# Instalar dependencias
pip install -r requirements.txt

# (Opcional) Configurar .env
cp .env.example .env

# Iniciar servicio
python main.py
```

**✅ AI Service corriendo en:** `http://localhost:8000`  
**📚 Documentación:** `http://localhost:8000/docs`

---

## 🔐 Credenciales de Prueba

Una vez que todo esté corriendo, usa estas credenciales:

| Rol | Email | Password |
|-----|-------|----------|
| **Admin** | admin@logiflow.com | admin123 |
| **Operador** | operator@logiflow.com | operator123 |
| **Repartidor** | driver@logiflow.com | driver123 |

---

## 🎯 Flujo de Prueba Rápido

1. **Login** con el usuario admin
2. **Dashboard** → Ver métricas en tiempo real
3. **Clientes** → Crear un nuevo cliente
4. **Crear Pedido** → Agregar productos y asignar al cliente
5. **Optimizar Rutas** → Seleccionar pedidos y ver la ruta optimizada por IA
6. **Analytics** → Ver gráficos y estadísticas

---

## 🐛 Problemas Comunes

### Error: "Cannot find module"
```bash
# Solución: Reinstalar dependencias
cd backend && npm install
cd ../frontend && npm install
cd ../ai-service && pip install -r requirements.txt
```

### Error: "Port already in use"
```bash
# Solución: Matar proceso en el puerto
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

### Error: Prisma no conecta a PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
# Verificar credenciales en backend/.env
# DATABASE_URL debe coincidir con tu instalación

# Recrear base de datos
cd backend
npx prisma db push --force-reset
npx prisma db seed
```

### Error: AI Service no responde
```bash
# Verificar que Python y dependencias estén instaladas
python --version  # debe ser 3.11+
pip list | grep fastapi

# Reinstalar dependencias
cd ai-service
pip install -r requirements.txt --upgrade
```

---

## 📊 URLs Importantes

Una vez iniciado, tendrás acceso a:

- 🎨 **Frontend:** http://localhost:5173
- 🔧 **Backend API:** http://localhost:3000
- 🤖 **AI Service:** http://localhost:8000
- 📚 **API Docs (Swagger):** http://localhost:8000/docs
- 🗄️ **Prisma Studio:** `npx prisma studio` (en /backend)

---

## 🚀 Siguiente Paso: Deploy

¿Todo funciona localmente? ¡Genial! Ahora puedes deployar:

1. **Frontend** → [Vercel](https://vercel.com) (gratis)
2. **Backend** → [Railway](https://railway.app) (gratis con créditos)
3. **AI Service** → [Render](https://render.com) (gratis)
4. **Database** → PostgreSQL en Railway (gratis)

Ver guía completa: [DEPLOYMENT.md](./DEPLOYMENT.md) *(próximamente)*

---

## 💬 ¿Necesitas Ayuda?

- 📝 [Documentación Completa](./README.md)
- 🐛 [Reportar un Bug](https://github.com/Lisandro1313/LogiFlow/issues)
- 💡 [Pedir una Feature](https://github.com/Lisandro1313/LogiFlow/issues/new?template=feature_request.md)
- 💬 [Discussions](https://github.com/Lisandro1313/LogiFlow/discussions)

---

**¡Felicidades! LogiFlow está corriendo localmente.** 🎉

Ahora puedes explorar todas las funcionalidades y empezar a desarrollar tus propias features.
