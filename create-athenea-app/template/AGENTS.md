# AGENTS - create-athenea-app/template/

## Alcance

- Aplica solo a `create-athenea-app/template/**`.

## Reglas especificas

- Esta carpeta es un proyecto generado para usuarios finales: mantenerla autocontenida y ejecutable tras scaffolding.
- Si se cambian rutas, nombres de archivos o placeholders, actualizar `create-athenea-app/bin/index.js` en la misma tarea.
- Mantener paridad funcional minima entre template y app de referencia (entrypoints electron-vite y estructura `src/main`, `src/preload`, `src/renderer`).
- No agregar archivos generados (`out/`, `release/`, `node_modules/`) dentro del template.

## Auto-invocacion de skills

- Invocar `skills/create-athenea-template-sync/SKILL.md` al tocar cualquier archivo del template.
- Si se modifica IPC en template, usar tambien `skills/electron-ipc-contract/SKILL.md`.

## Checklist obligatorio

- [ ] Verificar que el template siga resolviendo `src/main/index.js`, `src/preload/index.js` y `src/renderer/index.html`.
- [ ] Verificar que los placeholders esperados por el CLI sigan presentes donde corresponda.
- [ ] Validar scaffolding con `node create-athenea-app/bin/index.js demo --no-install` en carpeta temporal.
