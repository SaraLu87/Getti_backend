# Registro de cambios (CHANGELOG)

Todos los cambios hechos entre el estado inicial (`baseline-antes`) y el estado final
(`final-despues`). Cada cambio indica **qué** se hizo, **por qué** y **qué prueba lo verifica**.
Las pruebas de `tests/` NO se modificaron entre las dos corridas.

## [final-despues]

### Patrones de diseño (cierran la brecha entre el informe de arquitectura y el código)

| # | Cambio | Motivo | Archivos | Prueba que lo verifica |
|---|---|---|---|---|
| 1 | **Strategy** de ordenamiento: `calificacion`, `visualizaciones`, `resenas`. Se usa con `GET /api/establecimientos?orden=...`. Un criterio desconocido responde 400. | El informe lo describía pero no existía. Permite agregar criterios sin tocar controladores. | `servicios/estrategias/index.js`, `servicios/establecimientoServicio.js` | `tests/unit/patrones.test.js` (Strategy), `tests/arquitectura/contrato.test.js` |
| 2 | **Observer**: bus de eventos interno (`EventEmitter` de Node, sin librerías). Si un suscriptor falla, la operación principal no se rompe. | El informe lo describía; `emailServicio.js` estaba vacío. | `eventos/busEventos.js`, `eventos/suscriptores.js` | `patrones.test.js` (Observer + Facade) |
| 3 | **Facade** `resenaFacade.publicar()`: guarda la reseña (con recálculo del promedio) y emite `resena.creada`. El controlador de reseñas ahora usa la fachada. | El informe mencionaba `ResenaFacade`, que no existía. | `servicios/resenaFacade.js`, `controladores/resenaControlador.js` | `patrones.test.js`, `tests/integration/resenas.test.js` |
| 4 | **Singleton** de conexión: `config/db.js` con `conectar()`, `estaConectado()` y `desconectar()`. `index.js` ya no llama a `mongoose.connect` directamente y termina con código 1 si no hay conexión. | Una sola conexión reutilizable y un punto único de configuración. | `config/db.js`, `index.js` | `patrones.test.js` (Singleton), `contrato.test.js` |

### Arquitectura en capas

| # | Cambio | Motivo | Archivos | Prueba |
|---|---|---|---|---|
| 5 | `authControlador.js` ya no importa el modelo `Usuario`; usa `usuarioServicio.obtenerPorCorreo()` y el nuevo `usuarioServicio.registrar()` (cifra la contraseña). | Era la única violación de la regla Controlador → Servicio → Modelo. | `controladores/authControlador.js`, `servicios/usuarioServicio.js` | `contrato.test.js` (regla de capas), `tests/integration/auth.test.js` |

### Seguridad e higiene del repositorio

| # | Cambio | Motivo | Archivos | Prueba |
|---|---|---|---|---|
| 6 | Se quitó el secreto JWT por defecto. Sin `JWT_SECRET` la app no arranca. | Con un error de configuración, el sistema firmaba tokens con una clave pública conocida. | `config/jwt.js`, `.env.example` | `contrato.test.js` (JWT) |
| 7 | `.gitignore.txt` se renombró a `.gitignore` (Git no lo reconocía) y ahora excluye `.env`, `node_modules/`, `uploads/*` y `coverage/`. | Evitar subir secretos y archivos de usuarios. | `.gitignore` | `contrato.test.js` (higiene) |
| 8 | Se sacaron del repositorio las 11 imágenes de `uploads/` (siguen en el disco de quien las tenga; solo dejan de versionarse). Se agrega `uploads/.gitkeep` para que la carpeta exista. | Eran archivos de ejecución, no código. | `uploads/` | — (revisión manual: `git ls-files uploads`) |

### Nota sobre el número de pruebas
La corrida ANTES reporta 47 pruebas y la DESPUÉS 48. No se agregó ninguna prueba: la regla
"los servicios no importan controladores ni rutas" se aplica automáticamente a cada archivo de
`servicios/`, y ahora hay uno más (`resenaFacade.js`).

### Compatibilidad
- Sin `?orden`, `GET /api/establecimientos` responde exactamente igual que antes.
- Las respuestas de registro, login y reseñas no cambian de forma.
- Nueva exigencia: el archivo `.env` debe tener `JWT_SECRET` (antes era opcional).
