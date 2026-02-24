---
name: electron-ipc-contract
description: Mantener contrato IPC seguro y sincronizado entre main y preload en la app Electron.
---

# Skill: electron-ipc-contract

## Trigger

- Se modifica `src/main/**` o `src/preload/**`.
- Se agrega, elimina o renombra un canal IPC.
- Se cambian opciones de `BrowserWindow` o reglas de seguridad del bridge.

## Reglas criticas

- Cada canal nuevo en `ipcMain.handle/on` debe existir en `src/preload/index.js` (API explicita y/o allowlist).
- No exponer acceso directo a Node en renderer; mantener `contextIsolation: true` y `nodeIntegration: false`.
- Si cambia el contrato de payload/respuesta, actualizar ambas capas en el mismo commit.
- En `preload`, restringir `ipc.invoke/send/on/once` a canales permitidos.

## Checklist rapido

- [ ] Inventariar canales tocados en `src/main/index.js`.
- [ ] Verificar paridad en `src/preload/index.js`.
- [ ] Revisar que `window.electronAPI` siga siendo el unico puente publico.
- [ ] Confirmar que no se relajaron opciones de seguridad en ventanas.

## Validacion

```bash
npm run lint
npm run typecheck
```

## Comprobacion puntual recomendada

```bash
rg "ipcMain\.(handle|on)\(" src/main/index.js
rg "ipcRenderer\.(invoke|send|on|once)\(" src/preload/index.js
```
