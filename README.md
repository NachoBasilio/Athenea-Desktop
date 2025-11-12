# 👥 Athenea - Dashboard Desktop App

Aplicación de escritorio profesional construida con tecnologías web modernas para un desarrollo ágil y mantenible.

## 🛠️ Stack Tecnológico

### Core

- 🧬 **[Preact](https://preactjs.com/)** - Alternativa ligera y rápida a React (3KB)
- ⚡ **[Vite](https://vitejs.dev/)** - Build tool ultrarrápido con HMR instantáneo
- 🖥️ **[Electron](https://www.electronjs.org/)** - Framework para apps de escritorio multiplataforma
- 📦 **[electron-builder](https://www.electron.build/)** - Empaquetado y distribución

### Gestión de Estado y Datos

- 🐻 **[Zustand](https://zustand-demo.pmnd.rs/)** - State management minimalista (1KB)
- 🌐 **[Axios](https://axios-http.com/)** & **[Ky](https://github.com/sindresorhus/ky)** - HTTP clients
- 🔐 **[Keytar](https://github.com/atom/node-keytar)** - Almacenamiento seguro de credenciales
- 🎯 **[Zod](https://zod.dev/)** - Validación de schemas TypeScript-first
- 🔑 **[jwt-decode](https://github.com/auth0/jwt-decode)** - Decodificación de tokens JWT

### Utilidades

- 📅 **[Day.js](https://day.js.org/)** - Manipulación de fechas (2KB)
- 🖨️ **[pdf-to-printer](https://github.com/artiebits/pdf-to-printer)** - Impresión de PDFs
- 📝 **[electron-log](https://github.com/megahertz/electron-log)** - Sistema de logging
- 🔄 **[electron-updater](https://www.electron.build/auto-update)** - Auto-actualizaciones

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
# Ejecutar solo frontend en navegador (modo web)
npm run dev

# Ejecutar app completa de escritorio con hot-reload
npm run dev:electron

# Ejecutar solo Electron (requiere build previo)
npm run electron
```

### Build y Distribución

```bash
# Compilar frontend para producción
npm run build

# Vista previa del build
npm run preview

# Generar instalador completo (Windows/Linux/Mac)
npm run dist

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

---

## 💻 Instalación y Configuración

### Requisitos Previos

- **Node.js** v18.0.0 o superior
- **npm** v8.0.0 o superior
- **Git** (recomendado)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/athenea.git
cd athenea

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
npm run dev:electron
```

Esto iniciará:

- Vite dev server en `http://localhost:5171`
- Ventana de Electron automáticamente

### Modo Desarrollo Web

Para desarrollo solo en navegador:

```bash
npm run dev
```

Luego abrí `http://localhost:5171` en tu navegador.

---

## 📦 Build para Producción

### 1. Compilar y Probar

```bash
# Compilar frontend
npm run build

# Probar en Electron
npm run electron
```

### 2. Generar Instalador

```bash
npm run dist
```

Esto generará instaladores en la carpeta `dist/` según tu plataforma:

- **Windows:** `.exe` (NSIS installer)
- **Linux:** `.AppImage`, `.deb`, `.rpm`
- **macOS:** `.dmg`, `.pkg`

---

## 🏗️ Estructura del Proyecto

```
athenea/
├── src/                  # Código fuente del frontend
│   ├── components/       # Componentes Preact
│   ├── stores/          # Stores de Zustand
│   ├── utils/           # Utilidades y helpers
│   └── main.tsx         # Entry point
├── electron.js          # Proceso principal de Electron
├── preload.js           # Script de preload (bridge seguro)
├── dist/                # Build de producción
├── assets/              # Recursos para el instalador
└── package.json         # Dependencias y scripts
```

---

## 🔒 Seguridad

- **Credenciales:** Almacenadas de forma segura con `keytar` usando el keychain del sistema operativo
- **Context isolation:** Habilitado para proteger el proceso renderer
- **Preload script:** Expone solo APIs necesarias de forma controlada
- **Code signing:** Configurado para Windows (ajustar según necesidad)

---

## 🚢 Distribución y Updates

La app está configurada para auto-actualizaciones usando `electron-updater`:

```json
"publish": [
  {
    "provider": "generic",
    "url": "https://updates.tuapp.com/"
  }
]
```

Para usar updates automáticos, configurá tu servidor de updates y actualizá la URL.

---

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

### Error en dev:electron

- Asegurate que el puerto 5171 esté disponible
- Verificá que no haya otra instancia de Electron corriendo

---

## 📚 Recursos Útiles

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

Este proyecto es privado. Ver `LICENSE` para más información.

---

## 👨‍💻 Soporte

¿Tenés dudas o problemas?

- 🐛 Reportá bugs en [Issues](https://github.com/tu-usuario/athenea/issues)
- 💬 Discusiones en [Discussions](https://github.com/tu-usuario/athenea/discussions)
- 📧 Email: soporte@tuapp.com

---
