# 🚚 LogiFlow - Plataforma SaaS para Gestión Logística de Última Milla

<div align="center">

![LogiFlow Banner](https://img.shields.io/badge/LogiFlow-Enterprise_Logistics_Platform-blue?style=for-the-badge)

### **Optimización de rutas con IA | Gestión en tiempo real | Analytics avanzado**

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4+-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/Lisandro1313/LogiFlow/graphs/commit-activity)

[Demo](#-demo) • [Características](#-características-principales) • [Arquitectura](#-arquitectura) • [Instalación](#-instalación) • [Documentación](#-documentación)

</div>

---

## 🎯 ¿Qué es LogiFlow?

**LogiFlow** es una plataforma empresarial completa para gestionar operaciones de logística y entrega de última milla. Diseñada para empresas de delivery, e-commerce y servicios de mensajería que necesitan **optimizar rutas, gestionar flotas y aumentar eficiencia operativa**.

### 🚀 El Problema que Resolvemos

Las empresas de logística pierden **30-40% de tiempo** y **recursos** en:
- ❌ Rutas mal planificadas
- ❌ Asignaciones manuales de pedidos
- ❌ Falta de visibilidad en tiempo real
- ❌ Métricas desactualizadas
- ❌ Comunicación ineficiente con repartidores

### ✅ Nuestra Solución

LogiFlow ofrece:
- ✅ **Optimización automática de rutas** usando K-Means + TSP
- ✅ **Dashboard ejecutivo** con métricas en tiempo real
- ✅ **Gestión completa de pedidos** con seguimiento detallado
- ✅ **Analytics avanzado** con 6+ tipos de visualizaciones
- ✅ **Asignación inteligente** de pedidos a repartidores
- ✅ **Importación masiva** desde Excel/CSV
- ✅ **APIs RESTful** para integraciones externas

---

## 📊 Demo

> � **Video Demo:** [Ver en YouTube](#) *(próximamente)*

**Credenciales de prueba:**
```
Admin:
  Email: admin@logiflow.com
  Password: admin123

Operador:
  Email: operator@logiflow.com
  Password: operator123

Repartidor:
  Email: driver@logiflow.com
  Password: driver123
```

---

## ✨ Características Principales

### 📦 Gestión de Pedidos
- ✅ CRUD completo con filtros avanzados (estado, zona, fecha, búsqueda)
- ✅ Detalle completo con timeline de eventos
- ✅ Creación rápida con múltiples productos
- ✅ Importación masiva desde Excel
- ✅ Generación de PDFs
- ✅ Estados: Pendiente → En Proceso → Entregado/Cancelado

### 🚚 Gestión de Agentes (Repartidores)
- ✅ Perfiles completos con estadísticas
- ✅ Toggle activo/inactivo
- ✅ Métricas: entregas del día, tasa de éxito, calificación
- ✅ Asignación automática a rutas
- ✅ Seguimiento en tiempo real (preparado con WebSockets)

### 🗺️ Optimización de Rutas con IA
- ✅ **Algoritmo K-Means** para clustering de pedidos por zona
- ✅ **Problema del Viajante (TSP)** para secuencia óptima
- ✅ Cálculo automático de distancia y tiempo
- ✅ Visualización de secuencia de entrega
- ✅ Creación automática de rutas optimizadas
- ✅ Fallback si servicio de IA no disponible

### 👥 CRM de Clientes
- ✅ Gestión completa de base de datos
- ✅ Historial de pedidos por cliente
- ✅ Búsqueda y filtros
- ✅ Validación de datos

### 📈 Analytics Avanzado
- ✅ 6 tipos de gráficos interactivos (Recharts)
- ✅ Filtros por rango de fechas
- ✅ KPIs: Ingresos, pedidos, valor promedio, zonas activas
- ✅ Análisis por zona geográfica
- ✅ Patrones por día de semana y hora
- ✅ Exportación a CSV
- ✅ Ranking de mejores zonas

### ⚙️ Panel de Configuración
- ✅ Gestión de perfil de usuario
- ✅ Cambio de contraseña con validaciones
- ✅ Preferencias de notificaciones (Email, Push, SMS)
- ✅ Configuración por tipo de evento

### 🔐 Autenticación y Seguridad
- ✅ JWT con refresh tokens
- ✅ Roles: Admin, Operador, Repartidor
- ✅ Middleware de autorización
- ✅ Passwords hasheadas con bcrypt
- ✅ Protección de rutas en frontend

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                      │
│  Dashboard | Orders | Customers | Agents | Routes | Analytics  │
│         TailwindCSS | React Query | Zustand | Recharts         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REST API (Axios)
                             │ WebSockets (Socket.io)
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                API GATEWAY (Node.js + Express)                  │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────────┐  │
│  │  Auth    │  Orders  │  Agents  │  Routes  │  Dashboard   │  │
│  │  Module  │  Module  │  Module  │  Module  │   Module     │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────────┘  │
│         JWT Middleware | Error Handler | Validators            │
└──────┬──────────────────────────────────┬──────────────────────┘
       │                                  │
       │                                  │ HTTP Proxy
       ▼                                  ▼
┌──────────────────────┐        ┌────────────────────────┐
│   PostgreSQL 15      │        │  AI SERVICE (Python)   │
│   ┌──────────────┐   │        │  ┌──────────────────┐  │
│   │ Prisma ORM   │   │        │  │ K-Means Cluster  │  │
│   └──────────────┘   │        │  │ TSP Optimization │  │
│                      │        │  │ Delivery Time    │  │
│  Tables:             │        │  │   Prediction     │  │
│  - users             │        │  └──────────────────┘  │
│  - customers         │        │  FastAPI + sklearn     │
│  - orders            │        └────────────────────────┘
│  - order_details     │
│  - agents            │
│  - routes            │
│  - route_orders      │
│  - tracking          │
└──────────────────────┘
```

### 🔄 Flujo de Optimización de Rutas

```
1. Usuario selecciona pedidos pendientes
   ↓
2. Frontend envía lista de coordenadas → Backend
   ↓
3. Backend proxy → AI Service (Python)
   ↓
4. K-Means agrupa pedidos por zonas geográficas
   ↓
5. TSP calcula secuencia óptima dentro de cada cluster
   ↓
6. Retorna: distancia total, tiempo estimado, secuencia
   ↓
7. Frontend visualiza ruta optimizada
   ↓
8. Usuario crea ruta y asigna a agente
```

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18.3 | UI Library |
| **Vite** | 5.4 | Build Tool & Dev Server |
| **React Router** | 6.26 | Client-side routing |
| **React Query** | 5.56 | Server state management |
| **Zustand** | 5.0 | Client state (auth) |
| **TailwindCSS** | 3.4 | Styling framework |
| **Recharts** | 2.12 | Data visualization |
| **Axios** | 1.7 | HTTP client |
| **date-fns** | 4.1 | Date utilities |
| **Lucide React** | 0.451 | Icon library |
| **React Hook Form** | 7.53 | Form management |
| **Zod** | 3.23 | Schema validation |

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20+ | Runtime |
| **Express** | 4.21 | Web framework |
| **Prisma** | 5.20 | ORM & Database toolkit |
| **PostgreSQL** | 15+ | Relational database |
| **JWT** | 9.0 | Authentication |
| **bcryptjs** | 2.4 | Password hashing |
| **Zod** | 3.23 | Input validation |
| **Socket.io** | 4.8 | Real-time communication |
| **PDFKit** | 0.15 | PDF generation |
| **ExcelJS** | 4.4 | Excel file processing |

### AI Service
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Python** | 3.11+ | Language |
| **FastAPI** | 0.104+ | Web framework |
| **scikit-learn** | 1.5 | Machine learning |
| **NumPy** | 2.1 | Numerical computing |
| **Pandas** | 2.2 | Data manipulation |
| **Uvicorn** | 0.32 | ASGI server |

---

## 💾 Modelo de Base de Datos

### Diagrama ER

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    users     │         │  customers   │         │    agents    │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │         │ id (PK)      │
│ email        │         │ name         │         │ name         │
│ password     │         │ email        │         │ phone        │
│ name         │         │ phone        │         │ vehicle      │
│ role         │         │ address      │         │ is_active    │
│ phone        │         │ created_at   │         │ rating       │
│ created_at   │         └──────────────┘         │ created_at   │
└──────────────┘                │                 └──────────────┘
                                │                         │
                                ▼                         │
                       ┌──────────────┐                  │
                       │    orders    │◄─────────────────┘
                       ├──────────────┤
                       │ id (PK)      │
                       │ customer_id  │ ← FK
                       │ agent_id     │ ← FK (nullable)
                       │ status       │
                       │ total        │
                       │ address      │
                       │ lat, lng     │
                       │ zone         │
                       │ created_at   │
                       └──────┬───────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
     ┌──────────────┐              ┌──────────────────┐
     │order_details │              │   route_orders   │
     ├──────────────┤              ├──────────────────┤
     │ id (PK)      │              │ id (PK)          │
     │ order_id (FK)│              │ route_id (FK)    │
     │ product_name │              │ order_id (FK)    │
     │ quantity     │              │ sequence         │
     │ price        │              └──────────────────┘
     │ subtotal     │                        ▲
     └──────────────┘                        │
                                             │
                                    ┌────────┴─────────┐
                                    │      routes      │
                                    ├──────────────────┤
                                    │ id (PK)          │
                                    │ name             │
                                    │ agent_id (FK)    │
                                    │ status           │
                                    │ distance_km      │
                                    │ estimated_time   │
                                    │ created_at       │
                                    └──────────────────┘

┌──────────────┐
│   tracking   │
├──────────────┤
│ id (PK)      │
│ order_id (FK)│
│ agent_id (FK)│
│ lat, lng     │
│ status       │
│ notes        │
│ created_at   │
└──────────────┘
```

### Tablas Principales

#### `users`
Usuarios del sistema (admins, operadores, repartidores)
```sql
id: UUID, PRIMARY KEY
email: VARCHAR(255), UNIQUE
password: VARCHAR(255), HASHED
name: VARCHAR(255)
role: ENUM('admin', 'operator', 'driver')
phone: VARCHAR(20)
created_at: TIMESTAMP
```

#### `customers`
Base de datos de clientes
```sql
id: UUID, PRIMARY KEY
name: VARCHAR(255)
email: VARCHAR(255)
phone: VARCHAR(20)
address: TEXT
created_at: TIMESTAMP
```

#### `agents`
Repartidores/conductores
```sql
id: UUID, PRIMARY KEY
name: VARCHAR(255)
phone: VARCHAR(20)
vehicle_type: VARCHAR(50)
vehicle_plate: VARCHAR(20)
is_active: BOOLEAN
rating: DECIMAL(3,2)
deliveries_count: INTEGER
created_at: TIMESTAMP
```

#### `orders`
Pedidos principales
```sql
id: UUID, PRIMARY KEY
customer_id: UUID, FOREIGN KEY → customers(id)
agent_id: UUID, NULLABLE, FOREIGN KEY → agents(id)
status: ENUM('pending', 'in_progress', 'delivered', 'cancelled')
total: DECIMAL(10,2)
delivery_address: TEXT
latitude: DECIMAL(10,8)
longitude: DECIMAL(11,8)
zone: VARCHAR(100)
notes: TEXT
created_at: TIMESTAMP
```

#### `order_details`
Productos de cada pedido
```sql
id: UUID, PRIMARY KEY
order_id: UUID, FOREIGN KEY → orders(id) ON DELETE CASCADE
product_name: VARCHAR(255)
quantity: INTEGER
unit_price: DECIMAL(10,2)
subtotal: DECIMAL(10,2)
```

#### `routes`
Rutas de entrega
```sql
id: UUID, PRIMARY KEY
name: VARCHAR(255)
agent_id: UUID, FOREIGN KEY → agents(id)
status: ENUM('pending', 'in_progress', 'completed', 'cancelled')
total_distance_km: DECIMAL(10,2)
estimated_time_min: INTEGER
created_at: TIMESTAMP
```

#### `route_orders`
Relación Many-to-Many entre rutas y pedidos
```sql
id: UUID, PRIMARY KEY
route_id: UUID, FOREIGN KEY → routes(id) ON DELETE CASCADE
order_id: UUID, FOREIGN KEY → orders(id)
sequence: INTEGER (orden de entrega)
```

#### `tracking`
Historial de ubicaciones y estados
```sql
id: UUID, PRIMARY KEY
order_id: UUID, FOREIGN KEY → orders(id)
agent_id: UUID, FOREIGN KEY → agents(id)
latitude: DECIMAL(10,8)
longitude: DECIMAL(11,8)
status: VARCHAR(50)
notes: TEXT
created_at: TIMESTAMP
```

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/login              # Login con email/password
POST   /api/auth/register           # Registro de nuevo usuario
GET    /api/auth/profile            # Obtener perfil del usuario autenticado
PUT    /api/auth/profile            # Actualizar perfil
POST   /api/auth/change-password    # Cambiar contraseña
```

### Orders
```
GET    /api/orders                  # Listar pedidos (filtros: status, zone, search, dates)
GET    /api/orders/:id              # Detalle de pedido
POST   /api/orders                  # Crear nuevo pedido
PUT    /api/orders/:id              # Actualizar pedido
DELETE /api/orders/:id              # Eliminar pedido
GET    /api/orders/:id/pdf          # Descargar PDF del pedido
POST   /api/orders/import           # Importación masiva desde Excel
GET    /api/orders/stats            # Estadísticas generales
```

### Customers
```
GET    /api/customers               # Listar clientes (filtro: search)
GET    /api/customers/:id           # Detalle de cliente
POST   /api/customers               # Crear cliente
PUT    /api/customers/:id           # Actualizar cliente
DELETE /api/customers/:id           # Eliminar cliente
```

### Agents
```
GET    /api/agents                  # Listar agentes (filtros: status, search)
GET    /api/agents/:id              # Detalle de agente
POST   /api/agents                  # Crear agente
PUT    /api/agents/:id              # Actualizar agente
DELETE /api/agents/:id              # Eliminar agente
GET    /api/agents/:id/stats        # Estadísticas del agente
```

### Routes
```
GET    /api/routes                  # Listar rutas (filtros: status, agentId)
GET    /api/routes/:id              # Detalle de ruta
POST   /api/routes                  # Crear ruta
PUT    /api/routes/:id              # Actualizar ruta (cambiar estado)
DELETE /api/routes/:id              # Eliminar ruta
POST   /api/routes/optimize         # Optimizar ruta con IA
```

### Dashboard
```
GET    /api/dashboard/metrics       # KPIs: pedidos hoy, entregas, agentes activos
GET    /api/dashboard/trends        # Tendencias con filtro de fechas
```

### AI Service (Python)
```
POST   /optimize-route              # K-Means + TSP para ruta óptima
POST   /cluster-zones               # Agrupar pedidos por zona
POST   /predict-delivery-time       # Estimar tiempo de entrega
```

**Documentación interactiva:** `http://localhost:8000/docs` (Swagger UI)

---

## 🚀 Instalación

### Requisitos Previos
- **Node.js** 20+ 
- **Python** 3.11+
- **PostgreSQL** 15+
- **npm** o **yarn**
- **pip**

### 1️⃣ Clonar el Repositorio
```bash
git clone https://github.com/Lisandro1313/LogiFlow.git
cd LogiFlow
```

### 2️⃣ Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/logiflow"
JWT_SECRET="tu_secreto_super_seguro"
JWT_EXPIRES_IN="7d"
PORT=3000
AI_SERVICE_URL="http://localhost:8000"
```

Inicializar base de datos:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

Iniciar backend:
```bash
npm run dev
```
**Backend corriendo en:** `http://localhost:3000`

### 3️⃣ Configurar Frontend

```bash
cd frontend
npm install
```

Crear archivo `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

Iniciar frontend:
```bash
npm run dev
```
**Frontend corriendo en:** `http://localhost:5173`

### 4️⃣ Configurar AI Service

```bash
cd ai-service
pip install -r requirements.txt
```

Crear archivo `.env`:
```env
API_HOST=0.0.0.0
API_PORT=8000
```

Iniciar servicio:
```bash
python main.py
```
**AI Service corriendo en:** `http://localhost:8000`

### 5️⃣ Script Automático (Windows)

```powershell
.\start.ps1
```
Este script inicia automáticamente todos los servicios.

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# AI Service tests
cd ai-service
pytest
```

---

## 📚 Documentación

- **[FINAL_STATUS.md](./FINAL_STATUS.md)** - Estado del proyecto al 95%
- **[PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md)** - Documentación exhaustiva
- **[TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md)** - Detalles técnicos avanzados
- **[API Documentation](http://localhost:8000/docs)** - Swagger interactivo

---

## 🗺️ Roadmap

### ✅ Completado (95%)
- [x] Backend API completo con 50+ endpoints
- [x] Frontend con 10 páginas funcionales
- [x] Optimización de rutas con IA (K-Means + TSP)
- [x] Sistema de autenticación y roles
- [x] CRUD completo de Orders, Customers, Agents, Routes
- [x] Analytics avanzado con 6 tipos de gráficos
- [x] Panel de configuración de usuario
- [x] Importación masiva desde Excel
- [x] Generación de PDFs

### 🚧 En Progreso
- [ ] Mapa en tiempo real con Leaflet
- [ ] WebSockets para tracking live
- [ ] Tests E2E con Playwright
- [ ] Deploy a producción

### 📋 Próximas Features
- [ ] Notificaciones push reales
- [ ] App móvil para repartidores (React Native)
- [ ] Integración con APIs de mapas (Google Maps, Mapbox)
- [ ] Webhooks para integraciones externas
- [ ] Multi-tenancy para empresas
- [ ] Predicción de demanda con ML
- [ ] Chat en vivo repartidor-cliente

---

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 👤 Autor

**Lisandro**

- GitHub: [@Lisandro1313](https://github.com/Lisandro1313)
- LinkedIn: [Tu perfil](#)
- Email: tu-email@ejemplo.com
- Portfolio: [tu-portfolio.com](#)

---

## ⭐ Apoyo

Si este proyecto te resultó útil, considera darle una ⭐ en GitHub!

---

<div align="center">

**Hecho con ❤️ y mucho ☕ por Lisandro**

</div>

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
