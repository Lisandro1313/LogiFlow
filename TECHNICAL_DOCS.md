# 📊 LogiFlow - Documentación Técnica Completa

## 🎯 Resumen Ejecutivo

**LogiFlow** es una plataforma SaaS completa de gestión logística y última milla que demuestra capacidades full-stack avanzadas, arquitectura moderna y uso de tecnologías de IA.

### Características Principales

✅ **Dashboard en Tiempo Real** con métricas y WebSockets  
✅ **Gestión Completa de Pedidos** (CRUD + importación masiva)  
✅ **Optimización de Rutas con IA** (K-Means + TSP)  
✅ **Tracking GPS en Vivo** de repartidores  
✅ **Sistema de Roles y Permisos** (RBAC)  
✅ **Generación de PDFs y QR Codes**  
✅ **API REST completamente documentada**  
✅ **Aplicación móvil PWA** para repartidores

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

#### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **ORM:** Prisma
- **Base de Datos:** PostgreSQL 15
- **Caché:** Redis
- **Autenticación:** JWT + bcrypt
- **Validación:** Zod
- **Tiempo Real:** Socket.io
- **Generación PDF:** PDFKit
- **QR Codes:** qrcode

#### Frontend

- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State:** Zustand
- **API Client:** Axios + React Query
- **Estilos:** TailwindCSS
- **Gráficos:** Recharts
- **Mapas:** Leaflet + React Leaflet
- **Formularios:** React Hook Form + Zod
- **Notificaciones:** React Hot Toast

#### AI Service

- **Lenguaje:** Python 3.11+
- **Framework:** FastAPI
- **Machine Learning:** scikit-learn
- **Cálculos:** NumPy
- **Algoritmos:** K-Means Clustering, Nearest Neighbor TSP

#### DevOps

- **Containerización:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (futuro)
- **Hosting Backend:** Railway / Render
- **Hosting Frontend:** Vercel
- **Monitoreo:** pgAdmin

---

## 📦 Estructura del Proyecto

```
logiflow/
│
├── backend/                    # API REST en Node.js
│   ├── prisma/
│   │   ├── schema.prisma      # Esquema de base de datos
│   │   └── seed.js            # Datos de prueba
│   ├── src/
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── routes/            # Endpoints API
│   │   ├── middleware/        # Auth, errores, etc.
│   │   ├── config/            # Configuración
│   │   └── server.js          # Entry point
│   └── package.json
│
├── frontend/                   # Dashboard React
│   ├── src/
│   │   ├── components/        # Componentes UI
│   │   ├── pages/             # Vistas principales
│   │   ├── services/          # API calls
│   │   ├── stores/            # Estado global
│   │   ├── lib/               # Utilidades
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── ai-service/                 # Microservicio Python
│   ├── main.py                # FastAPI app
│   ├── requirements.txt
│   └── .env
│
├── mobile/                     # PWA para repartidores
│   └── (estructura similar a frontend)
│
├── docker-compose.yml         # Servicios (PostgreSQL, Redis)
├── .env.example               # Variables de entorno
├── setup.ps1                  # Script de instalación
├── start.ps1                  # Script de inicio
└── README.md
```

---

## 🗄️ Modelo de Base de Datos

### Diagrama ERD (Entidad-Relación)

```
┌─────────────┐       ┌──────────────────┐
│   users     │───────│ delivery_agents  │
└─────────────┘       └──────────────────┘
       │                      │
       │ creates              │ assigned to
       │                      │
       ▼                      ▼
┌─────────────┐       ┌─────────────┐
│   orders    │───────│   routes    │
└─────────────┘       └─────────────┘
       │                      │
       │ has                  │ contains
       │                      │
       ▼                      ▼
┌──────────────┐      ┌──────────────┐
│ order_items  │      │ route_orders │
└──────────────┘      └──────────────┘

       ┌─────────────┐
       │  customers  │───┐
       └─────────────┘   │
               │          │
        belong to         │
               │          │
               ▼          ▼
       ┌─────────────┐
       │    zones    │
       └─────────────┘

┌─────────────────┐      ┌──────────────────┐
│ tracking_logs   │      │ delivery_photos  │
└─────────────────┘      └──────────────────┘
```

### Tablas Principales

#### **users** (Usuarios del sistema)

- `id` (UUID, PK)
- `email` (Unique)
- `password` (Hash bcrypt)
- `firstName`, `lastName`
- `role` (ADMIN, OPERATOR, DELIVERY_AGENT)
- `isActive`

#### **delivery_agents** (Repartidores)

- `id` (UUID, PK)
- `userId` (FK → users)
- `phone`, `vehicleType`, `licensePlate`
- `isAvailable`, `rating`, `totalDeliveries`

#### **customers** (Clientes)

- `id` (UUID, PK)
- `firstName`, `lastName`, `email`, `phone`
- `address`, `latitude`, `longitude`
- `zoneId` (FK → zones)

#### **orders** (Pedidos)

- `id` (UUID, PK)
- `orderNumber` (Unique, ej: ORD-01001)
- `customerId` (FK → customers)
- `deliveryAddress`, `deliveryLat`, `deliveryLng`
- `status` (PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, FAILED)
- `priority` (LOW, NORMAL, HIGH, URGENT)
- `scheduledDate`, `scheduledTimeSlot`
- `totalAmount`, `notes`, `qrCode`

#### **order_items** (Productos del pedido)

- `id` (UUID, PK)
- `orderId` (FK → orders)
- `productName`, `quantity`, `unitPrice`, `totalPrice`

#### **routes** (Rutas de reparto)

- `id` (UUID, PK)
- `routeName`
- `deliveryAgentId` (FK → delivery_agents)
- `routeDate`, `status`
- `totalDistance`, `estimatedTime`, `actualTime`
- `optimizationData` (JSON con metadata del algoritmo)

#### **route_orders** (Relación N:N con secuencia)

- `id` (UUID, PK)
- `routeId` (FK → routes)
- `orderId` (FK → orders)
- `sequence` (Orden de visita)
- `status`, `deliveredAt`, `failedReason`

#### **tracking_logs** (Historial de ubicaciones)

- `id` (UUID, PK)
- `deliveryAgentId` (FK → delivery_agents)
- `orderId` (FK → orders, nullable)
- `latitude`, `longitude`, `status`, `speed`
- `timestamp`

#### **delivery_photos** (Comprobantes fotográficos)

- `id` (UUID, PK)
- `orderId` (FK → orders)
- `deliveryAgentId` (FK → delivery_agents)
- `photoUrl`, `uploadedAt`

#### **zones** (Zonas de reparto)

- `id` (UUID, PK)
- `name`, `description`
- `polygon` (JSON GeoJSON)
- `color`, `isActive`

---

## 🔐 Sistema de Seguridad

### Autenticación

**Tipo:** JWT (JSON Web Tokens)

**Flow:**

1. Usuario envía email + password
2. Backend valida credenciales
3. Si son correctas, genera token JWT con:
   - `userId`
   - `email`
   - `role`
   - `agentId` (si es repartidor)
   - Expiración: 7 días
4. Frontend almacena token en localStorage
5. Todas las peticiones subsecuentes incluyen: `Authorization: Bearer <token>`

### Autorización (RBAC)

**Roles:**

| Rol                | Permisos                                                        |
| ------------------ | --------------------------------------------------------------- |
| **ADMIN**          | Acceso total, gestión de usuarios, configuración del sistema    |
| **OPERATOR**       | Gestión de pedidos, clientes, rutas, asignación de repartidores |
| **DELIVERY_AGENT** | Ver rutas asignadas, actualizar estado de entregas, subir fotos |

**Implementación:**

- Middleware `authMiddleware`: verifica token válido
- Middleware `authorize(...roles)`: verifica rol del usuario

```javascript
router.post(
  "/orders",
  authMiddleware,
  authorize("ADMIN", "OPERATOR"),
  createOrder
);
```

---

## 🚀 API REST - Endpoints Principales

### Autenticación (`/api/auth`)

```http
POST   /auth/register         # Registrar usuario
POST   /auth/login            # Iniciar sesión
GET    /auth/profile          # Obtener perfil (requiere auth)
PUT    /auth/profile          # Actualizar perfil
PUT    /auth/change-password  # Cambiar contraseña
```

### Pedidos (`/api/orders`)

```http
GET    /orders                # Listar pedidos (filtros, paginación)
GET    /orders/stats          # Estadísticas
GET    /orders/:id            # Detalle de pedido
POST   /orders                # Crear pedido
PUT    /orders/:id            # Actualizar pedido
DELETE /orders/:id            # Eliminar pedido
GET    /orders/:id/pdf        # Descargar PDF
POST   /orders/import         # Importación masiva (Excel)
```

### Clientes (`/api/customers`)

```http
GET    /customers             # Listar clientes
GET    /customers/:id         # Detalle cliente
POST   /customers             # Crear cliente
PUT    /customers/:id         # Actualizar cliente
DELETE /customers/:id         # Eliminar cliente
```

### Repartidores (`/api/agents`)

```http
GET    /agents                # Listar repartidores
GET    /agents/:id            # Detalle repartidor
GET    /agents/:id/stats      # Estadísticas
PUT    /agents/:id            # Actualizar repartidor
```

### Rutas (`/api/routes`)

```http
GET    /routes                # Listar rutas
GET    /routes/:id            # Detalle ruta
POST   /routes                # Crear ruta
POST   /routes/optimize       # Optimizar ruta (IA)
PUT    /routes/:id/status     # Actualizar estado
DELETE /routes/:id            # Eliminar ruta
```

### Zonas (`/api/zones`)

```http
GET    /zones                 # Listar zonas
POST   /zones                 # Crear zona
PUT    /zones/:id             # Actualizar zona
DELETE /zones/:id             # Eliminar zona
```

### Dashboard (`/api/dashboard`)

```http
GET    /dashboard/stats       # Métricas en tiempo real
GET    /dashboard/trends      # Tendencias (últimos N días)
```

### Tracking (`/api/tracking`)

```http
POST   /tracking/location     # Actualizar ubicación
GET    /tracking/agent/:id    # Última ubicación de agente
GET    /tracking/active       # Todos los agentes activos
```

---

## 🤖 Microservicio de IA

**Endpoint principal:** `http://localhost:8000`

### Optimización de Rutas

```http
POST /optimize-route
```

**Request Body:**

```json
{
  "orders": [
    {
      "id": "uuid",
      "lat": -34.9205,
      "lng": -57.9536,
      "address": "Calle 7 N° 845"
    }
  ],
  "depot_lat": -34.9205,
  "depot_lng": -57.9536
}
```

**Response:**

```json
{
  "route": [...],
  "totalDistance": 25.3,
  "estimatedTime": 85,
  "orderedPoints": [...]
}
```

**Algoritmo:**

1. **Clustering (K-Means):** Si hay >10 pedidos, agrupa en 3 zonas
2. **TSP (Nearest Neighbor):** Calcula ruta óptima por zona
3. **Cálculo de distancia:** Fórmula de Haversine (distancia real en km)
4. **Estimación de tiempo:**
   - Velocidad promedio: 40 km/h
   - Tiempo por entrega: 10 min
   - `tiempo_total = (distancia / velocidad) * 60 + (num_pedidos * 10)`

### Clustering de Zonas

```http
POST /cluster-zones
```

Agrupa pedidos por proximidad geográfica.

### Predicción de Tiempos

```http
POST /predict-delivery-time
```

Predice tiempo de entrega considerando:

- Distancia
- Cantidad de pedidos
- Hora del día (tráfico)
- Clima

---

## 📡 Comunicación en Tiempo Real (WebSockets)

**Tecnología:** Socket.io

**Eventos emitidos por el servidor:**

```javascript
// Nuevo pedido creado
io.emit("order-created", order);

// Pedido actualizado
io.emit("order-updated", order);

// Nueva ruta creada
io.emit("route-created", route);

// Ruta actualizada
io.emit("route-updated", route);

// Ubicación de agente actualizada
io.emit("agent-location", {
  agentId,
  latitude,
  longitude,
  status,
  timestamp,
});
```

**Uso en el frontend:**

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("agent-location", (data) => {
  // Actualizar mapa en tiempo real
  updateMarker(data.agentId, data.latitude, data.longitude);
});
```

---

## 📱 Aplicación Móvil (PWA)

**Características:**

✅ Funciona offline (Service Worker)  
✅ Instalable en dispositivo  
✅ Geolocalización en segundo plano  
✅ Cámara para fotos de comprobante  
✅ Notificaciones push

**Páginas principales:**

1. **Login**
2. **Rutas asignadas del día**
3. **Detalle de pedido**
4. **Navegación (integración con Google Maps)**
5. **Marcar entrega** (éxito/fallo)
6. **Subir foto comprobante**

---

## 🎨 UI/UX - Diseño de Interfaz

### Paleta de Colores

- **Primary:** #3B82F6 (Azul)
- **Success:** #10B981 (Verde)
- **Warning:** #F59E0B (Naranja)
- **Danger:** #EF4444 (Rojo)
- **Gray:** Escalas de grises

### Componentes Reutilizables

- **Card:** Contenedores con sombra
- **Badge:** Estados visuales (pendiente, entregado, etc.)
- **Button:** Variantes primary, secondary, danger
- **Input:** Con validación y mensajes de error
- **Table:** Con ordenamiento, filtros y paginación
- **Modal:** Para confirmaciones y formularios
- **Sidebar:** Navegación principal
- **Chart:** Gráficos con Recharts

---

## 🧪 Testing (Futuro)

### Backend

- **Unit Tests:** Jest
- **Integration Tests:** Supertest
- **Coverage:** >80%

### Frontend

- **Unit Tests:** Vitest
- **Component Tests:** React Testing Library
- **E2E:** Playwright

---

## 🚀 Deployment

### Backend (Railway/Render)

```bash
# Build
npm run build

# Start
npm start

# Variables de entorno requeridas:
DATABASE_URL
JWT_SECRET
REDIS_URL
FRONTEND_URL
```

### Frontend (Vercel)

```bash
# Build
npm run build

# Variables de entorno:
VITE_API_URL
VITE_WS_URL
VITE_GOOGLE_MAPS_API_KEY
```

### AI Service (Railway)

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## 📈 Métricas de Performance

**Objetivos:**

- **Backend API:** Respuesta < 200ms (promedio)
- **Frontend:** First Contentful Paint < 1.5s
- **Base de datos:** Queries optimizadas con índices
- **Caché (Redis):** Para búsquedas frecuentes

**Optimizaciones implementadas:**

✅ Lazy loading de rutas  
✅ React Query para caché de API  
✅ Índices en PostgreSQL  
✅ Compresión de imágenes  
✅ Paginación server-side

---

## 🔮 Roadmap Futuro

### Versión 2.0

- [ ] Integración con WhatsApp API
- [ ] Chat en vivo operador-repartidor
- [ ] Sistema de notificaciones push
- [ ] Dashboard de repartidor con gamificación
- [ ] Predicciones más avanzadas con TensorFlow

### Versión 3.0

- [ ] Blockchain para trazabilidad
- [ ] IoT para vehículos inteligentes
- [ ] Análisis de sentimiento de clientes
- [ ] Multi-tenant (SaaS real)

---

## 📚 Referencias y Recursos

- [Node.js Docs](https://nodejs.org/docs/)
- [React Docs](https://react.dev/)
- [Prisma Docs](https://www.prisma.io/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Leaflet Docs](https://leafletjs.com/)
- [Socket.io Docs](https://socket.io/docs/)

---

## 👨‍💻 Autor

**Tu Nombre**  
Full Stack Developer | DevOps Enthusiast

- Portfolio: [tuportfolio.com](https://tuportfolio.com)
- LinkedIn: [linkedin.com/in/tuperfil](https://linkedin.com/in/tuperfil)
- GitHub: [@tuusuario](https://github.com/tuusuario)
- Email: tuemail@ejemplo.com

---

## 📄 Licencia

MIT License

Copyright (c) 2024 LogiFlow

---

**⭐ Este proyecto demuestra:**

✅ Arquitectura de microservicios  
✅ REST API robusta con autenticación  
✅ Frontend moderno con React  
✅ Machine Learning aplicado  
✅ Tiempo real con WebSockets  
✅ Base de datos relacional compleja  
✅ DevOps con Docker  
✅ Código limpio y escalable

**Ideal para portfolio de Full Stack Developer Senior** 🚀
