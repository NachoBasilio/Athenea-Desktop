---
name: desktop-quality-gates
description: Ejecutar compuertas minimas de calidad para la app desktop y detectar desviaciones de configuracion.
---

# Skill: desktop-quality-gates

## Trigger

- Antes de cerrar cualquier cambio tecnico o de documentacion operativa.
- Cuando se tocan `package.json`, `electron.vite.config.js`, `tsconfig.json` o contratos IPC.

## Reglas criticas

- Ejecutar validaciones desde la raiz del repo.
- No asumir hooks de husky: validar de forma explicita.
- Reportar fallas con comando y error principal; no ocultarlas.

## Checklist rapido

- [ ] Confirmar version de Node objetivo (`.nvmrc` y engines) antes de validar.
- [ ] Correr lint y typecheck.
- [ ] Correr build cuando se afecte flujo de empaquetado o entrypoints.

## Validacion minima

```bash
npm run lint
npm run typecheck
npm run build
```
