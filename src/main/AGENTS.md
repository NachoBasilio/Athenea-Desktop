# AGENTS - src/main/

## Alcance

- Aplica a `src/main/**`.

## Reglas especificas

- Toda API expuesta al renderer debe pasar por IPC; no habilitar `nodeIntegration` para resolver atajos.
- Mantener sincronia de canales con `src/preload/index.js`.
- Si se cambia `BrowserWindow`, conservar defaults de seguridad (`contextIsolation: true`, `nodeIntegration: false`).
- Si se tocan recursos de empaquetado o rutas de binarios (backend), validar comportamiento en dev (`app.isPackaged` false) y empaquetado (`app.isPackaged` true).

## Auto-invocacion de skills

- Invocar `skills/electron-ipc-contract/SKILL.md` en cualquier cambio de IPC o de manejo de ventanas.
- Invocar `skills/desktop-quality-gates/SKILL.md` antes de cerrar.

## Checklist obligatorio

- [ ] Revisar que no haya canales IPC sin allowlist correspondiente en preload.
- [ ] Revisar lifecycle de app (`whenReady`, `window-all-closed`, `activate`) y no romperlo.
- [ ] Ejecutar `npm run lint` y `npm run build` en raiz cuando se altere flujo de app.
