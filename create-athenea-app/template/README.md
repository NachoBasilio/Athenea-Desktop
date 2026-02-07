# **APP_TITLE**

Aplicación de escritorio creada con [Athenea](https://github.com/tu-usuario/athenea-desktop).

## Stack

- **Electron** - Framework para apps de escritorio
- **electron-vite** - Build tool optimizado para Electron
- **Preact** - UI library liviana (3KB)
- **preact-iso** - Router minimalista

## Estructura

```
src/
├── main/           # Proceso principal de Electron
│   └── index.js
├── preload/        # Scripts de preload (bridge seguro)
│   └── index.js
└── renderer/       # Aplicación frontend
    ├── index.html
    ├── public/     # Assets estáticos
    └── src/        # Código fuente React/Preact
        ├── main.jsx
        ├── app.jsx
        ├── components/
        └── routes/
```

## Scripts

```bash
# Desarrollo
npm run dev          # Inicia en modo desarrollo (Windows)
npm run dev:linux    # Inicia en modo desarrollo (Linux)

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
await window.electronAPI.settings.get();
await window.electronAPI.settings.set({ key: "value" });

// Abrir ventana secundaria con una ruta específica
window.electronAPI.window.openRoute("/mi-ruta");
window.electronAPI.window.openRoute({ route: "/mi-ruta", title: "Mi Ventana" });
```
