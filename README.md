# 👥 Athenea - Dashboard Desktop App

[![npm version](https://img.shields.io/npm/v/create-athenea-app.svg)](https://www.npmjs.com/package/create-athenea-app)
[![license](https://img.shields.io/npm/l/create-athenea-app.svg)](https://github.com/ignadev/Athenea-Desktop/blob/main/LICENSE)

Plantilla pública lista para usar como base de app de escritorio con **Electron + Preact + Vite**, usando [electron-vite](https://electron-vite.org/) para un flujo de desarrollo integrado.

Creado por **Ignacio Basilio** (Ignadev).

## ⚡ Inicio Rápido

```bash
npm create athenea-app@latest
```

O con nombre directo:

```bash
npm create athenea-app@latest mi-proyecto
cd mi-proyecto
npm run dev
```

## 🛠️ Stack Tecnológico

### Core

- 🧬 **[Preact](https://preactjs.com/)** - Alternativa ligera y rápida a React (3KB)
- ⚡ **[Vite](https://vitejs.dev/)** - Build tool ultrarrápido con HMR instantáneo
- 🖥️ **[Electron](https://www.electronjs.org/)** - Framework para apps de escritorio multiplataforma
- 🔧 **[electron-vite](https://electron-vite.org/)** - Integración Vite + Electron (HMR, build unificado)
- 📦 **[electron-builder](https://www.electron.build/)** - Empaquetado y distribución

### Gestión de Estado y Datos

- 🐻 **[Zustand](https://zustand-demo.pmnd.rs/)** - State management minimalista (1KB)
- 🌐 **[Ky](https://github.com/sindresorhus/ky)** - HTTP client ligero
- 🔐 **[Keytar](https://github.com/atom/node-keytar)** - Almacenamiento seguro de credenciales
- 🎯 **[Zod](https://zod.dev/)** - Validación de schemas TypeScript-first
- 🔑 **[jwt-decode](https://github.com/auth0/jwt-decode)** - Decodificación de tokens JWT
- ⚡ **[@preact/signals](https://preactjs.com/guide/v10/signals/)** - Estado reactivo
- 📊 **[@tanstack/react-table](https://tanstack.com/table)** - Tablas flexibles
- 🍬 **[SweetAlert2](https://sweetalert2.github.io/)** - Alertas modales

### Utilidades

- 📅 **[Day.js](https://day.js.org/)** - Manipulación de fechas (2KB)
- 🖨️ **[pdf-to-printer](https://github.com/artiebits/pdf-to-printer)** - Impresión de PDFs
- 📝 **[electron-log](https://github.com/megahertz/electron-log)** - Sistema de logging
- 🔄 **[electron-updater](https://www.electron.build/auto-update)** - Auto-actualizaciones (configurable)

### Desarrollo

- 🎨 **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- 📘 **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- ✅ **[Vitest](https://vitest.dev/)** - Framework de testing ultrarrápido
- 🎭 **[@testing-library/preact](https://testing-library.com/docs/preact-testing-library/intro/)** - Testing de componentes
- 🧹 **[ESLint](https://eslint.org/)** + **[Prettier](https://prettier.io/)** - Linting y formateo

---

## 🚀 Scripts Disponibles

### Desarrollo

```bash
# Desarrollo completo (Electron + Vite con HMR)
npm run dev

# En Linux, si tenés problemas de sandbox:
npm run dev:linux
```

### Build y Distribución

```bash
# Compilar todo (main + preload + renderer)
npm run build

# Vista previa del build
npm run preview

# Generar instalador completo (Windows/Linux)
npm run dist

# Targets específicos
npm run dist:win
npm run dist:linux

# Generar solo carpeta empaquetada (sin instalador)
npm run pack
```

### Calidad de Código

```bash
# Análisis de código con ESLint
npm run lint

# Formatear código con Prettier
npm run format

# Verificación de tipos TypeScript
npm run typecheck

# Ejecutar tests
npm run test
```

## 🧭 Guía Operativa: AGENTS + Skills

Este repositorio usa una capa de reglas operativas para mantener cambios consistentes entre app desktop, renderer y CLI.

### Cómo funciona AGENTS

- `AGENTS.md` (raíz) define reglas globales del proyecto.
- Cada zona relevante tiene su propio `AGENTS.md` (`src/`, `src/main/`, `src/preload/`, `src/renderer/`, `create-athenea-app/`, `create-athenea-app/template/`).
- Regla de precedencia: siempre manda el `AGENTS.md` más cercano al archivo editado.

### Skills disponibles y para qué sirve cada una

- `skills/electron-ipc-contract/SKILL.md`: asegura consistencia y seguridad del contrato IPC entre `src/main/` y `src/preload/`.
- `skills/renderer-preact-routes/SKILL.md`: guía cambios en rutas/componentes del renderer Preact manteniendo estructura y patrones de UI.
- `skills/create-athenea-template-sync/SKILL.md`: obliga sincronía entre `create-athenea-app/bin/` y `create-athenea-app/template/` para que el scaffolding no se rompa.
- `skills/desktop-quality-gates/SKILL.md`: define gates mínimos de calidad antes de cerrar cambios (lint, typecheck/build y coherencia documental).

### Política de versionado limpio

- Se versiona solo código y configuración fuente.
- Se ignoran salidas generadas de build/distribución (`out/`, `release/`, `dist/`, `dist-ssr/`).
- Se ignoran dependencias/caches de tooling (`node_modules/`, `.npm/`, `.pnpm-store/`, `.vite/`, `.cache/`, `.eslintcache`, `coverage/`, `*.tsbuildinfo`).

---

## 💻 Instalación y Configuración

### Requisitos Previos

- **Node.js** v22.0.0 o superior (requerido). Usamos Node 22 para alinear con Electron 35 y evitar rebuilds de nativos. Incluimos `.nvmrc` y `.node-version` para fijar versión.
- **npm** v8.0.0 o superior
- **Git** (recomendado)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/ignadev/Athenea-Desktop.git
cd Athenea-Desktop

# 2. Instalar dependencias
npm install

# 3. (Opcional) Configurar variables de entorno
cp .env.example .env
```

---

## 🧪 Desarrollo Local

### Modo Desarrollo Completo

Para desarrollo con hot-reload en Electron:

```bash
npm run dev
```

Esto iniciará:

- Build de main y preload
- Vite dev server para el renderer
- Electron con HMR automático

> **Nota Linux:** Si tenés errores de sandbox, usá `npm run dev:linux` que agrega `--no-sandbox`.

---

## 📦 Build para Producción

### 1. Compilar y Probar

```bash
# Compilar todo
npm run build

# Preview
npm run preview
```

### 2. Generar Instalador

```bash
npm run dist
```

Esto generará instaladores en la carpeta `release/` según tu plataforma:

- **Windows:** `.exe` (NSIS installer)
- **Linux:** `.AppImage`, `.deb`

---

## 🏗️ Estructura del Proyecto

```
athenea/
├── AGENTS.md              # Reglas globales del repo
├── skills/                # Skills operativas por dominio
│   ├── electron-ipc-contract/
│   ├── renderer-preact-routes/
│   ├── create-athenea-template-sync/
│   └── desktop-quality-gates/
├── src/
│   ├── AGENTS.md          # Reglas de app desktop
│   ├── main/             # Proceso principal de Electron
│   │   ├── AGENTS.md
│   │   └── index.js      # Entry point, manejo de ventanas, IPC
│   ├── preload/          # Scripts de preload
│   │   ├── AGENTS.md
│   │   └── index.js      # Bridge seguro (window.electronAPI)
│   └── renderer/         # UI (Preact)
│       ├── AGENTS.md
│       ├── index.html    # HTML principal
│       ├── public/       # Assets estáticos
│       └── src/          # Código fuente del renderer
│           ├── components/
│           ├── routes/
│           └── main.jsx
├── create-athenea-app/    # CLI para scaffolding (publicado en npm)
│   ├── AGENTS.md
│   ├── bin/
│   └── template/
│       └── AGENTS.md
├── resources/            # Assets para electron-builder (iconos, BMP)
├── out/                  # Output del build (generado)
├── release/              # Instaladores generados
├── electron.vite.config.js
└── package.json
```

---

## 🔒 Seguridad

- **Credenciales:** Almacenadas de forma segura con `keytar` usando el keychain del sistema operativo
- **Context isolation:** Habilitado para proteger el proceso renderer
- **Preload script:** Expone solo APIs necesarias de forma controlada (window.electronAPI)
- **Code signing:** Configurado para Windows (ajustar según necesidad)

---

## 🚢 Distribución y Updates

- El build coloca los artefactos en `release/`.
- `electron-updater` está disponible; configurá `publish` en `package.json` si vas a usar updates.

---

## 🎨 Branding (nombre e imágenes)

Este repo está pensado como plantilla. Por defecto dejamos todo en **genérico** para que puedas "re-brandear" sin buscar strings sueltos.

### Nombre de la app (producción)

- Instalador / app empaquetada: `package.json` → `build.productName`
- Identificador (AppUserModelId / bundle id): `package.json` → `build.appId`

### Títulos visibles (runtime)

- Ventanas de Electron: `src/main/index.js` → `BrowserWindow({ title: ... })`
- HTML (cuando corre como web/renderer): `src/renderer/index.html` → `<title>`

### Recursos del instalador (electron-builder / NSIS)

Estos archivos se incluyen como placeholders **blancos** para que el build no falle si todavía no tenés diseño:

- Ícono: `resources/build.ico`
- Sidebar instalador: `resources/installer-sidebar.bmp`
- Header instalador: `resources/installer-header.bmp`

Reemplazalos por tus assets finales manteniendo los mismos nombres/rutas.

### Favicon del renderer (Vite)

- `src/renderer/index.html` referencia `./public/vite.svg`

---

## 📦 Recursos empaquetados

- Por defecto no se incluye ningún recurso extra.
- Si necesitás sumar binarios o archivos externos, configuralos en `build.extraResources` en `package.json`.
- Mantené esos recursos fuera del repositorio si son generados o sensibles y copiá las versiones necesarias antes de `npm run dist` o `npm run pack`.

## 🧰 Troubleshooting

### Error al instalar dependencias

```bash
# Limpiar cache e instalar nuevamente
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Error con módulos nativos

```bash
# Reinstalar dependencias nativas de Electron
npm run postinstall
```

### Error en Linux (sandbox)

```bash
# Usar el script con --no-sandbox
npm run dev:linux
```

---

## 📚 Recursos Útiles

- [Documentación de electron-vite](https://electron-vite.org/)
- [Documentación de Preact](https://preactjs.com/guide/v10/getting-started)
- [Guía de Vite](https://vitejs.dev/guide/)
- [Electron API Docs](https://www.electronjs.org/docs/latest)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Creá tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrí un Pull Request

---

## 📄 Licencia

Repositorio público pensado como plantilla. Definí y agregá tu `LICENSE` antes de distribuir una app basada en esto.

---

## 👨‍💻 Soporte

¿Tenés dudas o problemas?

- 🐛 Reportá bugs en [Issues](https://github.com/ignadev/Athenea-Desktop/issues)
- 💬 Discusiones en [Discussions](https://github.com/ignadev/Athenea-Desktop/discussions)
- 📧 Email: ignacio.n.basilio.b@gmail.com

---
