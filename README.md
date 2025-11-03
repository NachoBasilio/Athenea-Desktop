# 👥 Athenea - App de escritorio con Preact + Vite + Electron

Esta es una aplicación de escritorio construida con:

- 🧬 [Preact](https://preactjs.com/)
- ⚡ [Vite](https://vitejs.dev/)
- 🖥️ [Electron](https://www.electronjs.org/)
- 📆 [electron-builder](https://www.electron.build/) para empaquetado

---

## 🚀 Scripts disponibles

### `npm run dev`

Corre solo el frontend (Vite) en el navegador. Últil para desarrollo web.

### `npm run dev:electron`

Corre Vite **y** Electron al mismo tiempo. Ideal para desarrollo de escritorio.

### `npm run build`

Genera los archivos de frontend en `dist/` listos para producción.

### `npm run electron`

Lanza la app de escritorio usando los archivos del build. Asegurate de correr `npm run build` primero.

### `npm run dist`

Empaqueta la app para distribución (genera instaladores como `.exe`, `.AppImage`, `.dmg`, etc.)

---

## 💠 Instalación

1. Cloná el repositorio
2. Instalá dependencias:

```
npm install
```

---

## 🧪 Desarrollo

Para ver tu app de escritorio en tiempo real con hot reload:

```
npm run dev:electron
```

---

## 📆 Build para producción

1. Generá los archivos de producción del frontend:

```
npm run build
```

2. Luego ejecutá Electron apuntando a esos archivos:

```
npm run electron
```

---

## 📄 Empaquetado final

Para generar instaladores listos para distribuir:

```
npm run dist
```

Esto generará una carpeta `dist/` con el instalador listo para compartir según tu sistema operativo.

---

## ✅ Requisitos

- Node.js v18+
- npm
- (Opcional) Git

---

¿Dudas o sugerencias? ¡Abrí un issue o mandá PRs! 😄
