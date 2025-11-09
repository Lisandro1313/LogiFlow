# 🤝 Contributing to LogiFlow

¡Gracias por tu interés en contribuir a LogiFlow! Este documento proporciona pautas para contribuir al proyecto.

## 📋 Tabla de Contenidos
- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Pull Requests](#pull-requests)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Features](#sugerir-features)

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta profesional. Al participar, se espera que mantengas este código.

### Comportamiento Esperado
- ✅ Usar lenguaje acogedor e inclusivo
- ✅ Ser respetuoso con diferentes puntos de vista
- ✅ Aceptar críticas constructivas con gracia
- ✅ Enfocarse en lo que es mejor para la comunidad
- ✅ Mostrar empatía hacia otros miembros

### Comportamiento Inaceptable
- ❌ Lenguaje o imágenes sexualizadas
- ❌ Trolling, comentarios insultantes o ataques personales
- ❌ Acoso público o privado
- ❌ Publicar información privada de otros sin permiso
- ❌ Conducta poco profesional

## 🚀 ¿Cómo puedo contribuir?

### 1. Reportar Bugs 🐛

Si encuentras un bug:

1. **Verifica** que no haya sido reportado anteriormente en [Issues](https://github.com/Lisandro1313/LogiFlow/issues)
2. **Abre un nuevo issue** usando el template de bug report
3. **Incluye**:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del entorno (OS, versiones, etc.)

### 2. Sugerir Features ✨

Para proponer nuevas características:

1. **Revisa** el roadmap en README.md
2. **Busca** si ya existe una propuesta similar
3. **Abre un issue** con el template de feature request
4. **Describe**:
   - Problema que resuelve
   - Solución propuesta
   - Alternativas consideradas
   - Impacto en usuarios

### 3. Contribuir con Código 💻

#### Fork y Clone
```bash
# Fork el repositorio en GitHub
# Luego clona tu fork:
git clone https://github.com/TU-USUARIO/LogiFlow.git
cd LogiFlow

# Agrega el repositorio original como upstream
git remote add upstream https://github.com/Lisandro1313/LogiFlow.git
```

#### Crear una Rama
```bash
# Actualiza tu main
git checkout main
git pull upstream main

# Crea una rama descriptiva
git checkout -b feature/nombre-feature
# o
git checkout -b fix/nombre-bug
```

#### Nomenclatura de Ramas
- `feature/` - Nuevas características
- `fix/` - Correcciones de bugs
- `docs/` - Cambios en documentación
- `refactor/` - Refactorización de código
- `test/` - Agregar o modificar tests
- `chore/` - Tareas de mantenimiento

## 🛠️ Proceso de Desarrollo

### Setup Local

1. **Backend:**
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

2. **Frontend:**
```bash
cd frontend
npm install
npm run dev
```

3. **AI Service:**
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

### Ejecutar Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# AI Service
cd ai-service
pytest
```

### Commit Guidelines

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` Nueva característica
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan código)
- `refactor:` Refactorización
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

**Ejemplos:**
```bash
feat(orders): add bulk import from Excel
fix(routes): resolve optimization algorithm error
docs(readme): update installation instructions
refactor(api): simplify error handling middleware
```

### Pre-commit Checks

Antes de hacer commit, asegúrate de:

- ✅ El código compila sin errores
- ✅ Todos los tests pasan
- ✅ El código sigue los estándares de estilo
- ✅ Has agregado tests para nuevas features
- ✅ La documentación está actualizada

## 📝 Estándares de Código

### JavaScript/React

```javascript
// ✅ BIEN
const handleSubmit = async (data) => {
  try {
    const result = await orderService.create(data)
    toast.success('Pedido creado exitosamente')
    navigate(`/orders/${result.id}`)
  } catch (error) {
    toast.error(error.message)
  }
}

// ❌ MAL
const handleSubmit = async (data) => {
  orderService.create(data).then((result) => {
    toast.success('Pedido creado exitosamente')
    navigate(`/orders/${result.id}`)
  }).catch((error) => {
    toast.error(error.message)
  })
}
```

**Reglas:**
- Usar `const` por defecto, `let` solo si es necesario
- Nombres descriptivos en camelCase
- Funciones async/await, no promises con `.then()`
- Componentes funcionales con hooks
- PropTypes o TypeScript para validación
- Destructuring cuando sea posible

### Python

```python
# ✅ BIEN
def optimize_route(orders: List[Order]) -> OptimizedRoute:
    """
    Optimiza una ruta usando K-Means y TSP.
    
    Args:
        orders: Lista de pedidos con coordenadas
        
    Returns:
        Ruta optimizada con secuencia y métricas
    """
    if not orders:
        raise ValueError("La lista de pedidos no puede estar vacía")
    
    clusters = kmeans_cluster(orders)
    sequence = solve_tsp(clusters)
    
    return OptimizedRoute(
        sequence=sequence,
        total_distance=calculate_distance(sequence),
        estimated_time=estimate_time(sequence)
    )
```

**Reglas:**
- PEP 8 style guide
- Type hints en funciones
- Docstrings en funciones públicas
- snake_case para nombres
- Error handling explícito

### SQL/Prisma

```prisma
// ✅ BIEN
model Order {
  id              String   @id @default(uuid())
  customerId      String   @map("customer_id")
  customer        Customer @relation(fields: [customerId], references: [id])
  status          OrderStatus @default(PENDING)
  total           Decimal  @db.Decimal(10, 2)
  deliveryAddress String   @map("delivery_address")
  createdAt       DateTime @default(now()) @map("created_at")
  
  @@map("orders")
  @@index([customerId])
  @@index([status])
}
```

**Reglas:**
- snake_case para nombres de tablas y columnas
- Usar `@map` para mapear nombres
- Índices en foreign keys y campos filtrados
- Validaciones a nivel de base de datos

## 🔍 Pull Requests

### Checklist antes de crear PR

- [ ] El código compila sin warnings
- [ ] Todos los tests pasan
- [ ] Agregué tests para nuevo código
- [ ] Actualicé la documentación
- [ ] Mi código sigue los estándares del proyecto
- [ ] Los commits siguen Conventional Commits
- [ ] La rama está actualizada con main

### Template de PR

```markdown
## Descripción
[Descripción clara de los cambios]

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo ha sido probado?
[Describe las pruebas realizadas]

## Screenshots (si aplica)
[Agregar capturas de pantalla]

## Checklist
- [ ] Mi código sigue los estándares
- [ ] He realizado una auto-revisión
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan warnings
- [ ] He agregado tests
- [ ] Tests nuevos y existentes pasan
```

### Proceso de Review

1. Al menos 1 aprobación requerida
2. Todos los checks de CI deben pasar
3. No conflictos con main
4. Comentarios resueltos

## 🐛 Reportar Bugs

### Template de Bug Report

```markdown
**Describe el bug**
[Descripción clara del problema]

**Pasos para reproducir**
1. Ir a '...'
2. Click en '....'
3. Scroll hasta '....'
4. Ver error

**Comportamiento esperado**
[Qué debería suceder]

**Screenshots**
[Si aplica, agregar capturas]

**Entorno:**
 - OS: [e.g. Windows 11]
 - Browser: [e.g. Chrome 120]
 - Node: [e.g. 20.10.0]
 - Versión: [e.g. 1.0.0]

**Información adicional**
[Cualquier contexto adicional]
```

## ✨ Sugerir Features

### Template de Feature Request

```markdown
**¿El feature está relacionado a un problema?**
[Descripción clara del problema. Ej: "Siempre me frustra que..."]

**Describe la solución que te gustaría**
[Solución clara y concisa]

**Alternativas consideradas**
[Otras soluciones evaluadas]

**Contexto adicional**
[Screenshots, mockups, ejemplos]
```

## 🎓 Recursos

- [React Documentation](https://react.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Python PEP 8](https://peps.python.org/pep-0008/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Prisma Docs](https://www.prisma.io/docs/)

## 📞 Contacto

¿Preguntas? Abre un [Discussion](https://github.com/Lisandro1313/LogiFlow/discussions) o contacta al maintainer.

---

**¡Gracias por contribuir a LogiFlow!** 🚀
