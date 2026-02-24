---
name: renderer-preact-routes
description: Guiar cambios en renderer Preact (rutas, componentes y estilos) sin romper entrypoints.
---

# Skill: renderer-preact-routes

## Trigger

- Se modifica `src/renderer/**`.
- Se cambia `app.jsx`, rutas de `preact-iso` o componentes visuales.

## Reglas criticas

- Mantener render inicial en `src/renderer/src/main.jsx` sobre `#app`.
- Preservar enrutado base con `LocationProvider` + `Router` en `src/renderer/src/app.jsx`.
- Consumir APIs de escritorio solo por `window.electronAPI` (nunca `import 'electron'` en renderer).
- Mantener estilos sin bloquear uso en ventanas pequenas (evitar layout fijo no responsive sin motivo).

## Checklist rapido

- [ ] Verificar que `src/renderer/index.html` siga apuntando a `./src/main.jsx`.
- [ ] Verificar que las rutas default y `/` sigan resolviendo componente valido.
- [ ] Revisar imports relativos y assets (`public/`) para no romper build.

## Validacion

```bash
npm run lint
npm run typecheck
npm run build
```
