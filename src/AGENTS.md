# AGENTS - src/

## Alcance

- Aplica a todo `src/` (main, preload y renderer).
- Si hay un `AGENTS.md` mas especifico en `src/main`, `src/preload` o `src/renderer`, ese archivo manda.

## Reglas especificas

- Mantener arquitectura electron-vite: `src/main/index.js`, `src/preload/index.js`, `src/renderer/index.html`.
- Conservar seguridad de ventanas: `contextIsolation: true`, `nodeIntegration: false`.
- Si se agregan canales IPC, reflejar el cambio en main y preload en la misma tarea.
- Respetar entrypoints reales definidos en `electron.vite.config.js`.

## Auto-invocacion de skills

- `skills/electron-ipc-contract/SKILL.md` al tocar `src/main/**` o `src/preload/**`.
- `skills/renderer-preact-routes/SKILL.md` al tocar `src/renderer/**`.
- `skills/desktop-quality-gates/SKILL.md` antes de cerrar el cambio.

## Checklist obligatorio

- [ ] Verifique que los canales IPC existan en main y preload.
- [ ] Verifique que la app renderer siga montando en `#app`.
- [ ] Ejecute validaciones de calidad en raiz (`npm run lint`, `npm run typecheck`, `npm run build` cuando aplique).
