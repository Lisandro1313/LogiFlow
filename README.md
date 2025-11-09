# 🚚 LogiFlow - Plataforma Inteligente de Distribución y Última Milla

> Gestión completa de pedidos, rutas, repartidores y clientes, con analítica avanzada e IA.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-yellow.svg)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://postgresql.org/)

## 🎯 Descripción

LogiFlow es una plataforma completa de gestión logística que integra:

- **Dashboard Ejecutivo** con métricas en tiempo real
- **Gestión de Pedidos** con CRUD completo e importación masiva
- **Optimización de Rutas** usando algoritmos de IA
- **App para Repartidores** (PWA móvil)
- **Gestión de Clientes** (CRM integrado)
- **Módulo de IA** para predicciones y análisis

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)               │
│           Dashboard | Orders | Routes | Analytics       │
└───────────────────────────┬─────────────────────────────┘
                            │ REST API + WebSockets
┌───────────────────────────┴─────────────────────────────┐
│              API Gateway (Node.js + Express)            │
│        Auth | Orders | Agents | Customers | Routes      │
└─────┬──────────────┬────────────────┬───────────────────┘
      │              │                │
      ▼              ▼                ▼
┌──────────┐  ┌──────────────┐  ┌──────────────┐
│PostgreSQL│  │ AI Service   │  │  WebSockets  │
│  +Redis  │  │(Python/Fast) │  │   (Socket.io)│
└──────────┘  └──────────────┘  └──────────────┘
```

## 📦 Estructura del Proyecto

```
logiflow/
├── backend/          # API REST (Node.js + Express + Prisma)
├── frontend/         # Dashboard Web (React + Vite)
├── mobile/           # App Repartidores (React PWA)
├── ai-service/       # Microservicio IA (Python + FastAPI)
└── docker-compose.yml
```

## 🚀 Instalación Rápida

### ⚡ Inicio Rápido (Windows)

**Opción 1: Setup Automático (Recomendado)**

```powershell
# 1. Setup inicial (solo una vez)
.\setup.ps1

# 2. Iniciar todos los servicios
.\start.ps1

# 3. Abrir navegador en http://localhost:5173
# Login: admin@logiflow.com / admin123
```

**Opción 2: Manual**

### Requisitos

- Node.js 18+ ([descargar](https://nodejs.org/))
- Python 3.11+ ([descargar](https://www.python.org/))
- Docker Desktop ([descargar](https://www.docker.com/products/docker-desktop/))

### 1. Levantar servicios con Docker

```powershell
docker-compose up -d
```

### 2. Configurar Backend

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

### 3. Configurar Frontend (nueva terminal)

```powershell
cd frontend
npm install
npm run dev
```

### 4. Configurar AI Service (nueva terminal)

```powershell
cd ai-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 5. Acceder a la aplicación

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/health
- **AI Service:** http://localhost:8000/docs
- **pgAdmin:** http://localhost:5050

**Usuario de prueba:** `admin@logiflow.com` / `admin123`

---

📖 **Ver guía completa:** [INSTALL.md](./INSTALL.md)  
📊 **Estado del proyecto:** [PROJECT_STATUS.md](./PROJECT_STATUS.md)  
📚 **Documentación técnica:** [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md)

## 📊 Módulos Principales

### ✅ 1. Dashboard Ejecutivo

- Métricas en tiempo real
- Mapa con pedidos en curso
- Gráficos de rendimiento
- WebSockets para actualizaciones live

### ✅ 2. Gestión de Pedidos

- CRUD completo
- Importación masiva (CSV/Excel)
- Generación de PDF
- Código QR por pedido
- Estados automáticos

### ✅ 3. Optimización de Rutas

- Clustering por zonas (K-Means)
- Cálculo de ruta óptima
- Minimización de distancia
- Estimación de tiempos
- Integración con Google Maps API

### ✅ 4. App Repartidores (PWA)

- Vista móvil responsive
- Geolocalización en vivo
- Subir fotos de comprobante
- Marcar entregas
- Navegación integrada

### ✅ 5. Gestión de Clientes

- CRM completo
- Historial de pedidos
- Segmentación automática
- Análisis de comportamiento

### ✅ 6. Módulo de IA

- Predicción de demoras
- Sugerencia de rutas óptimas
- Chat con IA para operadores
- Análisis de demanda

## 🗃️ Modelo de Datos

### Tablas principales

- `users` - Usuarios del sistema
- `delivery_agents` - Repartidores
- `customers` - Clientes
- `orders` - Pedidos
- `order_items` - Productos por pedido
- `routes` - Rutas generadas
- `tracking_logs` - Historial de ubicaciones
- `delivery_photos` - Comprobantes fotográficos
- `zones` - Zonas de reparto

## 🔐 Seguridad

- Autenticación JWT
- Roles y permisos (Admin, Operador, Repartidor)
- Encriptación bcrypt
- Validación con Zod
- Rate limiting
- CORS configurado

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📱 Deploy

### Backend (Railway/Render)

```bash
npm run build
npm start
```

### Frontend (Vercel)

```bash
npm run build
# Deploy automático con Vercel
```

### AI Service (Railway)

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## 🎨 Stack Tecnológico

### Backend

- Node.js + Express
- Prisma ORM
- PostgreSQL
- Redis (caché)
- Socket.io (WebSockets)
- JWT + bcrypt

### Frontend

- React 18
- Vite
- TailwindCSS
- Recharts
- React Query
- Zustand

### AI Service

- Python 3.11
- FastAPI
- scikit-learn
- NumPy/Pandas
- OpenAI API

### DevOps

- Docker + Docker Compose
- GitHub Actions
- Vercel
- Railway

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE)

## 👨‍💻 Autor

**Tu Nombre**

- Portfolio: [tuportfolio.com](https://tuportfolio.com)
- LinkedIn: [linkedin.com/in/tuperfil](https://linkedin.com/in/tuperfil)
- GitHub: [@tuusuario](https://github.com/tuusuario)

---

⭐ **Si te gustó este proyecto, dale una estrella en GitHub!**
