# create-athenea-app

CLI para generar una app de escritorio lista para laburar con **Electron + Preact + Vite**.

Usa [electron-vite](https://electron-vite.org/) para un flujo de desarrollo integrado:

- **HMR real** para el renderer (Preact)
- **Hot reload** para main y preload
- **Build unificado** de main, preload y renderer
- **electron-builder** listo para empaquetar

## Uso

```bash
npm create athenea-app@latest
```

O con nombre directo:

```bash
npm create athenea-app@latest mi-proyecto
```

## Opciones

- `--no-install`: no ejecuta `npm install` automaticamente
- `--help`: muestra la ayuda

## Stack incluido

- **Electron** - App de escritorio multiplataforma
- **Preact** - UI rapida y liviana (3kB)
- **preact-iso** - Routing simple
- **Vite** - Dev server ultra rapido + build optimizado
- **electron-vite** - Integra Vite con Electron (main + preload + renderer)
- **electron-builder** - Empaquetado para Windows, macOS, Linux
