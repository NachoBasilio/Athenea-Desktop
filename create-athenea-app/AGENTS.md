# AGENTS - create-athenea-app/

## Alcance

- Aplica a todo `create-athenea-app/` (CLI y plantilla).
- Si existe `create-athenea-app/template/AGENTS.md`, ese archivo tiene prioridad en la carpeta template.

## Reglas especificas

- Mantener compatibilidad Node `>=18` para el CLI (`create-athenea-app/package.json`).
- Toda modificacion de `template/` debe auditarse junto con `bin/index.js` para garantizar scaffolding consistente.
- Mantener placeholders/tokens usados por el CLI (`__APP_TITLE__`, `__APP_TITLE_JSON__`, `__APP_APP_ID__`) en sincronia con el reemplazo de `bin/index.js`.
- No introducir dependencias ni scripts en template que rompan el flujo base (`npm run dev`, `npm run build`, `npm run dist`).

## Auto-invocacion de skills

- Invocar `skills/create-athenea-template-sync/SKILL.md` al modificar `bin/**` o `template/**`.
- Invocar `skills/desktop-quality-gates/SKILL.md` al cerrar cambios en package/config/docs operativas.

## Checklist obligatorio

- [ ] Revisar sincronia entre archivos de `template/` y transformaciones del CLI.
- [ ] Ejecutar `node create-athenea-app/bin/index.js --help`.
- [ ] Si se cambian artefactos de plantilla, probar scaffolding con `--no-install` en carpeta temporal.
