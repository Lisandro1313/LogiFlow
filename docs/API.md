# 📚 API Documentation

## 🌐 Documentación Interactiva

### Swagger UI (Principal)
**URL Local:** `http://localhost:3000/api-docs`

Documentación interactiva completa con:
- ✅ Todos los endpoints
- ✅ Request/Response examples
- ✅ Schemas de datos
- ✅ Try it out functionality
- ✅ Authentication flow

### AI Service Docs
**URL Local:** `http://localhost:8000/docs`

Documentación auto-generada de FastAPI con:
- ✅ Algoritmos de optimización
- ✅ Endpoints de IA
- ✅ Request/Response models

---

## 🔐 Authentication

Todos los endpoints (excepto `/auth/login` y `/auth/register`) requieren autenticación JWT.

### Obtener Token

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@logiflow.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@logiflow.com",
      "name": "Admin User",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Usar Token

Incluir en headers de todas las peticiones:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📦 Endpoints Principales

### Orders

#### Listar Pedidos
```http
GET /api/orders?status=pending&zone=Lima&search=cliente
```

**Query Parameters:**
- `status` (optional): pending | in_progress | delivered | cancelled
- `zone` (optional): Filtrar por zona
- `search` (optional): Buscar en cliente/dirección
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `page` (optional): Número de página (default: 1)
- `limit` (optional): Items por página (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "customer": {
          "id": "uuid",
          "name": "Juan Pérez",
          "email": "juan@example.com"
        },
        "status": "pending",
        "total": 150.50,
        "deliveryAddress": "Av. Principal 123, Lima",
        "zone": "Lima Centro",
        "createdAt": "2025-11-08T10:00:00Z",
        "orderDetails": [
          {
            "productName": "Producto A",
            "quantity": 2,
            "unitPrice": 50.00,
            "subtotal": 100.00
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### Crear Pedido
```http
POST /api/orders
Content-Type: application/json
```

**Request Body:**
```json
{
  "customerId": "uuid",
  "deliveryAddress": "Av. Larco 1234, Miraflores",
  "latitude": -12.1234,
  "longitude": -77.5678,
  "zone": "Miraflores",
  "notes": "Llamar antes de llegar",
  "orderDetails": [
    {
      "productName": "Pizza Grande",
      "quantity": 2,
      "unitPrice": 45.00
    },
    {
      "productName": "Gaseosa 1.5L",
      "quantity": 1,
      "unitPrice": 8.50
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "status": "pending",
    "total": 98.50,
    "deliveryAddress": "Av. Larco 1234, Miraflores",
    "zone": "Miraflores",
    "createdAt": "2025-11-08T10:30:00Z"
  },
  "message": "Pedido creado exitosamente"
}
```

---

### Routes

#### Optimizar Ruta con IA
```http
POST /api/routes/optimize
Content-Type: application/json
```

**Request Body:**
```json
{
  "agentId": "uuid",
  "orders": [
    {
      "id": "uuid-1",
      "latitude": -12.0464,
      "longitude": -77.0428,
      "address": "Jr. Lampa 123"
    },
    {
      "id": "uuid-2",
      "latitude": -12.0500,
      "longitude": -77.0450,
      "address": "Av. Abancay 456"
    },
    {
      "id": "uuid-3",
      "latitude": -12.0520,
      "longitude": -77.0430,
      "address": "Jr. Ucayali 789"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDistance": 5.8,
    "estimatedTime": 35,
    "optimizedSequence": [
      {
        "orderId": "uuid-1",
        "sequence": 1,
        "address": "Jr. Lampa 123",
        "latitude": -12.0464,
        "longitude": -77.0428
      },
      {
        "orderId": "uuid-3",
        "sequence": 2,
        "address": "Jr. Ucayali 789",
        "latitude": -12.0520,
        "longitude": -77.0430
      },
      {
        "orderId": "uuid-2",
        "sequence": 3,
        "address": "Av. Abancay 456",
        "latitude": -12.0500,
        "longitude": -77.0450
      }
    ],
    "algorithm": "K-Means + TSP"
  }
}
```

---

### Dashboard

#### Obtener Métricas
```http
GET /api/dashboard/metrics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ordersToday": 45,
    "deliveriesToday": 32,
    "activeAgents": 8,
    "averageDeliveryTime": 28.5,
    "revenue": {
      "today": 2450.00,
      "thisWeek": 15800.00,
      "thisMonth": 68400.00
    },
    "ordersByStatus": {
      "pending": 15,
      "in_progress": 20,
      "delivered": 180,
      "cancelled": 5
    }
  }
}
```

---

## 🚨 Códigos de Error

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not found",
  "message": "Order not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## 📊 Rate Limiting

- **Requests:** 100 por 15 minutos por IP
- **Auth endpoints:** 5 por minuto por IP

---

## 🔄 Webhooks (Próximamente)

LogiFlow soportará webhooks para notificar eventos:

- `order.created`
- `order.updated`
- `order.delivered`
- `route.started`
- `route.completed`

---

## 📱 Postman Collection

Importa la colección completa:

👉 [LogiFlow.postman_collection.json](./LogiFlow.postman_collection.json)

Incluye:
- Todos los endpoints
- Variables de entorno
- Tests automatizados
- Request examples

---

## 🧪 Testing con cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@logiflow.com","password":"admin123"}'
```

### Obtener Pedidos
```bash
curl -X GET "http://localhost:3000/api/orders?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Crear Cliente
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "María García",
    "email": "maria@example.com",
    "phone": "+51999888777",
    "address": "Av. Arequipa 2000, Lima"
  }'
```

---

## 🤝 Soporte

¿Problemas con la API? Abre un issue:
👉 [GitHub Issues](https://github.com/Lisandro1313/LogiFlow/issues)
