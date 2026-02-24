# AGENTS - src/renderer/

## Alcance

- Aplica a `src/renderer/**`.

## Reglas especificas

- Mantener `src/renderer/index.html` con mount point `#app` y script `./src/main.jsx`.
- Mantener enrutado con `preact-iso` segun `src/renderer/src/app.jsx`.
- Si se usa IPC desde renderer, consumir via `window.electronAPI` (nunca import directo de `electron`).
- Cambios de estilos o componentes deben preservar comportamiento responsive basico (desktop + ventanas reducidas).

## Auto-invocacion de skills

- Invocar `skills/renderer-preact-routes/SKILL.md` al tocar rutas/componentes/estilos.
- Si el cambio involucra IPC, invocar tambien `skills/electron-ipc-contract/SKILL.md`.
- Invocar `skills/desktop-quality-gates/SKILL.md` antes de cerrar.

## Checklist obligatorio

- [ ] Verificar render inicial en `src/renderer/src/main.jsx`.
- [ ] Verificar rutas en `src/renderer/src/app.jsx`.
- [ ] Ejecutar `npm run lint` y `npm run typecheck` en raiz.
