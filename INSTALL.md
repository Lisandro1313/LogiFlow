# 🚀 Guía de Instalación y Puesta en Marcha - LogiFlow

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18+ ([descargar](https://nodejs.org/))
- **Python** 3.11+ ([descargar](https://www.python.org/))
- **Docker Desktop** ([descargar](https://www.docker.com/products/docker-desktop/))
- **Git** ([descargar](https://git-scm.com/))

## 🐳 Paso 1: Levantar Base de Datos con Docker

Abre PowerShell o Terminal en la carpeta raíz del proyecto y ejecuta:

```powershell
docker-compose up -d
```

Esto levantará:

- PostgreSQL en puerto **5432**
- Redis en puerto **6379**
- pgAdmin en puerto **5050**

### Verificar que los contenedores están corriendo:

```powershell
docker ps
```

Deberías ver 3 contenedores activos: `logiflow-db`, `logiflow-redis`, `logiflow-pgadmin`.

## 🔧 Paso 2: Configurar Backend

### 2.1 Instalar dependencias

```powershell
cd backend
npm install
```

### 2.2 Configurar base de datos con Prisma

```powershell
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# Poblar base de datos con datos de prueba
npm run prisma:seed
```

### 2.3 Iniciar servidor backend

```powershell
npm run dev
```

El servidor estará corriendo en **http://localhost:3000**

### ✅ Verificar que funciona:

Abre en tu navegador: http://localhost:3000/health

Deberías ver:

```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "service": "LogiFlow API"
}
```

## 🎨 Paso 3: Configurar Frontend

Abre **otra terminal** (deja el backend corriendo):

```powershell
cd frontend
npm install
npm run dev
```

El frontend estará en **http://localhost:5173**

## 🤖 Paso 4: Configurar Microservicio de IA (Python)

Abre **otra terminal**:

```powershell
cd ai-service

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
.\venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servicio
python main.py
```

El servicio de IA estará en **http://localhost:8000**

### ✅ Verificar que funciona:

Abre: http://localhost:8000/docs

Verás la documentación automática de FastAPI (Swagger UI).

## 🎯 Paso 5: Acceder a la Aplicación

### Aplicación Principal

**URL:** http://localhost:5173

### Usuarios de prueba:

| Rol          | Email                    | Contraseña |
| ------------ | ------------------------ | ---------- |
| Admin        | admin@logiflow.com       | admin123   |
| Operador     | operador@logiflow.com    | admin123   |
| Repartidor 1 | repartidor1@logiflow.com | admin123   |
| Repartidor 2 | repartidor2@logiflow.com | admin123   |

## 📊 Herramientas Adicionales

### pgAdmin (Administrar Base de Datos)

- **URL:** http://localhost:5050
- **Email:** admin@logiflow.com
- **Contraseña:** admin123

### Prisma Studio (Ver/Editar Datos)

```powershell
cd backend
npx prisma studio
```

Se abrirá en **http://localhost:5555**

## 🔍 Comandos Útiles

### Backend

```powershell
# Ver logs en desarrollo
npm run dev

# Ejecutar en producción
npm start

# Regenerar cliente Prisma
npx prisma generate

# Ver base de datos visualmente
npx prisma studio
```

### Frontend

```powershell
# Modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de build
npm run preview
```

### AI Service

```powershell
# Iniciar con recarga automática
uvicorn main:app --reload

# Ver documentación
# Abre http://localhost:8000/docs
```

## 🐛 Solución de Problemas

### Error: Puerto 5432 ya está en uso

```powershell
# Detener PostgreSQL local si lo tienes instalado
# O cambiar el puerto en docker-compose.yml
```

### Error: Cannot find module 'prisma'

```powershell
cd backend
npm install
npx prisma generate
```

### Error: Python no reconocido

Asegúrate de tener Python en el PATH. Reinicia la terminal después de instalar Python.

### Error de CORS en el frontend

Verifica que el backend esté corriendo en puerto 3000 y que las variables de entorno estén configuradas correctamente.

## 🚀 Siguiente Paso: Desarrollo

Ahora que todo está funcionando, puedes:

1. **Explorar el Dashboard** - Ver métricas y gráficos
2. **Crear Pedidos** - Probar el sistema de gestión
3. **Optimizar Rutas** - Probar el algoritmo de IA
4. **Ver Tracking en Tiempo Real** - WebSockets funcionando

## 📚 Documentación de APIs

- **Backend API:** http://localhost:3000/health (ver rutas en `backend/src/routes/`)
- **AI Service:** http://localhost:8000/docs (Swagger automático)

## 🎉 ¡Listo!

Tu entorno de desarrollo de LogiFlow está completamente configurado.

---

**Próximos pasos del roadmap:**

- ✅ FASE 0: Configuración inicial (COMPLETADO)
- 🔜 FASE 1: Base de datos completa
- 🔜 FASE 2: Sistema de autenticación robusto
- 🔜 FASE 3: Módulo de pedidos completo
- 🔜 Y mucho más...
