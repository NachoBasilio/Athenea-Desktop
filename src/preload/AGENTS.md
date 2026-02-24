# AGENTS - src/preload/

## Alcance

- Aplica a `src/preload/**`.

## Reglas especificas

- Exponer en `contextBridge` solo APIs necesarias y auditables.
- Cualquier canal nuevo debe estar implementado en `src/main/index.js` antes de exponerlo.
- Mantener allowlists en `api.ipc.invoke/send/on/once` consistentes con canales reales.
- Evitar exponer objetos globales o capacidades de Node no mediadas por IPC.

## Auto-invocacion de skills

- Invocar `skills/electron-ipc-contract/SKILL.md` al modificar bridge o canales.
- Invocar `skills/desktop-quality-gates/SKILL.md` antes de cerrar.

## Checklist obligatorio

- [ ] Verificar paridad de canales entre preload y main.
- [ ] Verificar que `window.electronAPI` siga siendo el unico contrato publico.
- [ ] Ejecutar `npm run lint` y `npm run typecheck` en raiz.
