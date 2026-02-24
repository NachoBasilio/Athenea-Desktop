---
name: create-athenea-template-sync
description: Mantener sincronia entre CLI create-athenea-app y su template para scaffolding correcto.
---

# Skill: create-athenea-template-sync

## Trigger

- Se modifica `create-athenea-app/bin/**`.
- Se modifica `create-athenea-app/template/**`.
- Se cambian tokens o archivos esperados por el proceso de copiado/reemplazo.

## Reglas criticas

- Si cambia un token de template, actualizar `tokenMap` y `replaceTokensInFile` en `create-athenea-app/bin/index.js`.
- Si cambia estructura del template, revisar rutas hardcodeadas del CLI (por ejemplo `src/main/index.js`, `src/renderer/index.html`).
- Mantener scripts base del template compatibles con README (`dev`, `build`, `dist`, `pack`).
- Conservar Node de CLI en `>=18` y Node de template en `>=22`.

## Checklist rapido

- [ ] Revisar que `bin/index.js` siga copiando `template/` correctamente.
- [ ] Revisar reemplazo de `__APP_TITLE__`, `__APP_TITLE_JSON__`, `__APP_APP_ID__`.
- [ ] Verificar que `package.json` del template siga coherente con `electron.vite.config.js`.

## Validacion

```bash
node create-athenea-app/bin/index.js --help
```

## Smoke test recomendado

```bash
# ejecutar desde una carpeta temporal vacia
node /ruta/al/repo/create-athenea-app/bin/index.js demo-app --no-install
```
