# __APP_TITLE_MARKDOWN__

Aplicación de escritorio creada con [Athenea](https://github.com/ignadev/Athenea-Desktop).

## Stack

- **Electron** - Framework para apps de escritorio
- **electron-vite** - Build tool optimizado para Electron
- **Preact** - UI library liviana (3KB)
- **preact-iso** - Router minimalista
- **Zustand** - Gestión de estado minimalista
- **Ky** - Cliente HTTP ligero
- **Zod** - Validación de esquemas
- **Tailwind CSS** - Preconfigurado para estilos utility-first
- **Vitest** + **@testing-library/preact** - Testing de componentes
- **ESLint** + **Prettier** - Linting y formateo

## Estructura

```
.
├── .prettierrc               # Configuración de Prettier (fuente única de estilo)
├── electron.vite.config.js   # Configuración de electron-vite
├── eslint.config.js          # Configuración de ESLint
├── postcss.config.js         # Configuración de PostCSS
├── tailwind.config.js        # Configuración de Tailwind CSS
├── vitest.config.js          # Configuración de Vitest
└── src/
    ├── main/           # Proceso principal de Electron
    │   └── index.js
    ├── preload/        # Scripts de preload (bridge seguro)
    │   └── index.js
    └── renderer/       # Aplicación frontend
        ├── index.html
        ├── public/     # Assets estáticos
        └── src/        # Código fuente Preact
            ├── main.jsx
            ├── app.jsx
            ├── components/     # Componentes con tests colocados
            │   └── Counter/
            │       ├── Counter.jsx
            │       └── Counter.test.jsx
            └── routes/
```

## Scripts

```bash
# Desarrollo
npm run dev          # Inicia en modo desarrollo (Windows)
npm run dev:linux    # Inicia en modo desarrollo (Linux)

# Calidad
npm run lint         # Ejecuta ESLint
npm run format       # Formatea el código con Prettier
npm test             # Ejecuta los tests con Vitest

# Build
npm run build        # Compila la aplicación
npm run pack         # Empaqueta sin crear instalador
npm run dist         # Crea instaladores para la plataforma actual
npm run dist:win     # Crea instalador para Windows
npm run dist:linux   # Crea instalador para Linux
```

## IPC disponible

El preload expone `window.electronAPI` con:

```javascript
// Guardar/leer configuración persistente
await window.electronAPI.settings.get()
await window.electronAPI.settings.set({ key: 'value' })

// Abrir ventana secundaria con una ruta específica
window.electronAPI.window.openRoute('/mi-ruta')
window.electronAPI.window.openRoute({ route: '/mi-ruta', title: 'Mi Ventana' })
```
