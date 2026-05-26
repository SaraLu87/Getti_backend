# Getti — Plataforma Gastronómica de Popayán

Sistema web para buscar, visualizar y gestionar establecimientos gastronómicos en Popayán. Desarrollado como MVP académico con React, Node.js, Express y MongoDB.

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Características principales](#características-principales)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Arquitectura del sistema](#arquitectura-del-sistema)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Roles del sistema](#roles-del-sistema)
- [Funcionalidades principales](#funcionalidades-principales)
- [Variables de entorno](#variables-de-entorno)
- [Ejecución del proyecto](#ejecución-del-proyecto)
- [API — Endpoints](#api--endpoints)
- [Capturas del sistema](#capturas-del-sistema)

---

## Descripción general

**Getti** es una plataforma gastronómica académica orientada a la ciudad de Popayán. Permite a los usuarios explorar y valorar restaurantes, bares y cafés; a los empresarios gestionar sus establecimientos y responder reseñas; y a los administradores controlar el sistema de forma centralizada desde un dashboard con métricas en tiempo real.

---

## Características principales

- Búsqueda y filtrado de establecimientos por nombre, tipo y etiquetas
- Sistema de reseñas con calificación de 1 a 5 estrellas
- Favoritos por usuario
- Conteo de visualizaciones por establecimiento
- Rankings de mejor calificados y más visitados
- Dashboards con estadísticas y métricas para admin y empresario
- Registro con verificación por correo electrónico
- Autenticación con JWT y control de acceso por roles
- Subida y visualización de imágenes locales
- Mapa de ubicación con Google Maps (fallback a iframe sin API key)
- Interfaz responsive y mobile-first con Bootstrap 5

---

## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite, React Router 7, Bootstrap 5, Axios |
| Mapas | @react-google-maps/api (con fallback a iframe de Google Maps) |
| Backend | Node.js, Express 4, Mongoose 7 |
| Base de datos | MongoDB |
| Autenticación | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) |
| Correo | Nodemailer |
| Archivos | Multer (imágenes locales) |

---

## Arquitectura del sistema

```
┌─────────────────────────────────────────┐
│  frontend-react  (puerto 5173)          │
│  React 19 + Vite + Bootstrap 5          │
│  Roles: usuario · empresario · admin    │
└────────────────────┬────────────────────┘
                     │ HTTP / Axios → /api
┌────────────────────▼────────────────────┐
│  Backend  (puerto 3000)                 │
│  Node.js + Express + JWT                │
└────────────────────┬────────────────────┘
                     │ Mongoose
┌────────────────────▼────────────────────┐
│  MongoDB                                │
│  Colecciones: usuarios · establ. · res. │
└─────────────────────────────────────────┘
```

El frontend único en React sirve todos los roles. Las rutas están protegidas por `RutaProtegida` según el rol del token JWT.

---

## Estructura del proyecto

```
getti/
├── .env                              ← Variables de entorno
├── index.js                          ← Entrada del servidor
├── app.js                            ← Express: rutas y middlewares
├── package.json
│
├── config/
│   └── jwt.js                        ← Configuración JWT
│
├── controladores/
│   ├── authControlador.js            ← Registro, login, verificación
│   ├── establecimientoControlador.js
│   ├── resenaControlador.js
│   └── usuarioControlador.js
│
├── middlewares/
│   ├── autenticacion.js              ← verificarToken
│   ├── roles.js                      ← verificarRol(...roles)
│   └── errores.js                    ← Handler global de errores
│
├── modelos/
│   ├── usuario.js                    ← Schema con estado enum
│   ├── establecimiento.js            ← Schema con 2dsphere e índices
│   └── resena.js                     ← Schema con calificacion min/max
│
├── rutas/
│   ├── authRutas.js
│   ├── establecimientoRutas.js
│   ├── resenaRutas.js
│   └── usuarioRutas.js
│
├── servicios/
│   ├── usuarioServicio.js
│   ├── establecimientoServicio.js
│   └── resenaServicio.js             ← Incluye actualizarEstadisticas()
│
├── scripts/
│   └── migrarEstado.js               ← Migración activo→estado (una vez)
│
├── uploads/                          ← Imágenes subidas localmente
│
└── frontend-react/
    └── src/
        ├── context/
        │   └── AuthContext.jsx       ← Token, usuario y rol global
        ├── components/
        │   ├── Navbar.jsx
        │   ├── RutaProtegida.jsx
        │   ├── TarjetaEstablecimiento.jsx
        │   ├── FormularioResena.jsx
        │   └── MapaEstablecimiento.jsx
        ├── servicios/                ← Llamadas a la API con Axios
        │   ├── api.js
        │   ├── auth.js
        │   ├── establecimientos.js
        │   ├── resenas.js
        │   └── usuarios.js
        └── pages/
            ├── Home.jsx              ← Búsqueda y catálogo
            ├── DetalleEstablecimiento.jsx ← Detalle, mapa, reseñas, favoritos
            ├── Login.jsx
            ├── Registro.jsx
            ├── RegistroEmpresario.jsx
            ├── VerificarCodigo.jsx
            ├── MiPerfil.jsx
            ├── DashboardEmpresario.jsx   ← Métricas + responder reseñas
            ├── Dashboard.jsx             ← Panel admin con rankings
            ├── Establecimientos.jsx      ← CRUD + asignación empresario
            ├── Usuarios.jsx              ← Gestión de usuarios y estados
            └── Resenas.jsx               ← Moderación de reseñas
```

---

## Roles del sistema

| Rol | Descripción |
|---|---|
| `admin` | Control total: usuarios, establecimientos, reseñas, métricas |
| `empresario` | Ve sus establecimientos asignados, consulta y responde reseñas |
| `usuario` | Busca establecimientos, crea reseñas, guarda favoritos |

### Estados de usuario

```
registro → pendiente → aprobado    (puede iniciar sesión)
                     → rechazado   (acceso denegado)
           aprobado  → inactivo    (desactivado por admin)
```

Un usuario recién registrado queda en `pendiente` hasta que el administrador lo apruebe.

---

## Funcionalidades principales

### Autenticación y acceso
- Registro con verificación de correo electrónico (código enviado por Nodemailer)
- Registro separado para empresarios
- Login con JWT (expira en 24 horas)
- Guards de ruta por rol (`RutaProtegida`)

### Módulo usuario
- Explorar establecimientos con búsqueda por keyword, tipo y etiquetas
- Ver detalle completo: imagen, descripción, horario, características, promociones visuales
- Calificar y comentar mediante reseñas (1–5 estrellas)
- Guardar y quitar favoritos
- Editar perfil propio

### Módulo empresario
- Panel con métricas: total de establecimientos, reseñas recibidas, calificación promedio, visualizaciones
- Lista de establecimientos asignados con estadísticas por local
- Lectura y respuesta a reseñas de sus establecimientos
- Indicador del local mejor valorado

### Módulo administrador — Dashboard
- Tarjetas de estadísticas: total usuarios, aprobados, pendientes, rechazados, establecimientos, reseñas
- Métricas adicionales: empresarios activos, total visualizaciones, promedio de reseñas
- Ranking de establecimientos mejor calificados (top 5)
- Ranking de establecimientos más visitados (top 5)
- Aprobación o rechazo rápido de usuarios pendientes

### Módulo administrador — Gestión
- CRUD completo de establecimientos con asignación de empresario
- Gestión de usuarios: cambio de estado (aprobar, rechazar, inactivar) y rol
- Moderación de reseñas (eliminación)

### Visualizaciones y rankings
- Cada visita a un detalle de establecimiento incrementa su contador de visualizaciones
- El promedio de calificación y el total de reseñas se recalculan automáticamente al crear o eliminar una reseña

### Mapas
- Integración con Google Maps API (`@react-google-maps/api`)
- Fallback automático a iframe de Google Maps cuando no hay API key configurada
- Enlace directo para abrir la ubicación en Google Maps

### Imágenes
- Subida de imágenes mediante Multer, almacenadas en `/uploads`
- Servidas como archivos estáticos desde el backend

---

## Variables de entorno

Crear el archivo `.env` en la raíz del proyecto:

```env
MONGO_URI=mongodb://localhost:27017/GETTI
PORT=3000
JWT_SECRET=cambia_esto_por_una_clave_segura
EMAIL_USER=correo@gmail.com
EMAIL_PASS=contraseña_de_aplicacion
```

Para habilitar Google Maps en el frontend, crear `frontend-react/.env`:

```env
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

> Si `VITE_GOOGLE_MAPS_API_KEY` no está definida, el mapa usa automáticamente el iframe de Google Maps como fallback.

---

## Ejecución del proyecto

### Requisitos previos

- Node.js 18 o superior
- MongoDB corriendo localmente en `mongodb://localhost:27017` (o URI de Atlas)
- npm 9 o superior

### Instalación

```bash
# 1. Clonar el repositorio
cd getti

# 2. Instalar dependencias del backend
npm install

# 3. Instalar dependencias del frontend
cd frontend-react && npm install && cd ..
```

### Migración de base de datos (solo si venías de una versión anterior)

```bash
node scripts/migrarEstado.js
```

Convierte el campo `activo: Boolean` al nuevo campo `estado: String` en la colección `usuarios`. Solo se ejecuta una vez.

### Arranque

Abrir dos terminales desde la carpeta raíz:

```bash
# Terminal 1 — Backend
node index.js

# Terminal 2 — Frontend React
cd frontend-react
npm run dev
```

| URL | Descripción |
|---|---|
| `http://localhost:3000` | API REST |
| `http://localhost:5173` | Aplicación web (todos los roles) |

---

## API — Endpoints

### Autenticación — `/api/auth`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/registro` | Crear cuenta (queda pendiente) | No |
| POST | `/login` | Iniciar sesión, devuelve JWT | No |
| POST | `/verificar` | Verificar código de correo | No |

> El token JWT debe enviarse en el header: `Authorization: Bearer <token>`

---

### Establecimientos — `/api/establecimientos`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/` | Listar establecimientos activos | No |
| GET | `/:id` | Ver detalle + registra visualización | No |
| GET | `/mis-establecimientos` | Establecimientos asignados | Empresario |
| POST | `/crear` | Crear establecimiento | Admin |
| PUT | `/editar/:id` | Editar establecimiento | Admin |
| DELETE | `/eliminar/:id` | Desactivar establecimiento | Admin |

**Filtros (GET /):**
```
?keyword=pizza        → busca en nombre, descripción, tipo, etiquetas
?tipo=restaurante     → filtra por tipo
```

---

### Reseñas — `/api/resenas`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/` | Listar reseñas activas | Autenticado |
| POST | `/crear` | Crear reseña | Usuario |
| PUT | `/editar/:id` | Editar reseña propia | Admin / Usuario |
| PUT | `/responder/:id` | Responder reseña | Empresario |
| DELETE | `/eliminar/:id` | Eliminar reseña | Admin |

---

### Usuarios — `/api/usuarios`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/perfil` | Ver mi perfil | Autenticado |
| PUT | `/perfil` | Editar mi perfil | Autenticado |
| POST | `/favorito/:id` | Agregar / quitar favorito | Autenticado |
| GET | `/favoritos` | Mis establecimientos favoritos | Autenticado |
| GET | `/` | Listar todos los usuarios | Admin |
| POST | `/crear` | Crear usuario directamente | Admin |
| PUT | `/editar/:id` | Editar usuario (estado, rol) | Admin |
| DELETE | `/eliminar/:id` | Desactivar usuario | Admin |

---

## Capturas del sistema

> Las siguientes capturas pueden agregarse a la carpeta `/docs` del proyecto.

| Pantalla | Ruta sugerida |
|---|---|
| Inicio / catálogo | `/docs/home.png` |
| Detalle de establecimiento | `/docs/detalle.png` |
| Login | `/docs/login.png` |
| Dashboard administrador | `/docs/dashboard-admin.png` |
| Panel empresario | `/docs/dashboard-empresario.png` |
| Gestión de usuarios | `/docs/usuarios.png` |
| Gestión de establecimientos | `/docs/establecimientos.png` |

---

## Notas técnicas

- Los índices de MongoDB (incluido `2dsphere`) se crean automáticamente al iniciar el servidor por primera vez.
- El soft delete en establecimientos y reseñas preserva los datos; los registros quedan con `activo: false` y dejan de aparecer en consultas públicas.
- El token JWT expira en 24 horas. El interceptor de Axios redirige a `/login` cuando detecta una respuesta 401.
- En desarrollo, el proxy de Vite evita problemas de CORS. En producción, configurar CORS en el backend o servir ambas aplicaciones desde el mismo dominio.
