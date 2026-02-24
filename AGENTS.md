# AGENTS - Athenea Desktop (raiz)

## Alcance

- Este archivo aplica a todo el repositorio.
- Si existe otro `AGENTS.md` en un subdirectorio, ese archivo tiene prioridad para su zona.

## Contexto real del proyecto

- Monorepo liviano con dos focos: app desktop (`src/`) y CLI generador (`create-athenea-app/`).
- Stack principal: Electron 35 + electron-vite 5 + Preact + Vite + TypeScript (typecheck) + ESLint.
- Runtime y build de app desktop en raiz (`package.json`), con Node `>=22`.
- CLI publicado como `create-athenea-app` con Node `>=18` en `create-athenea-app/package.json`.

## Reglas globales verificables

- Usar `npm` y scripts declarados en `package.json`; no agregar flows paralelos sin justificar.
- No editar artefactos generados: `out/`, `release/`, `node_modules/`.
- Mantener coherencia entre `src/main/index.js` (canales IPC) y `src/preload/index.js` (bridge/allowlist).
- Cualquier cambio en plantilla del CLI debe auditar sincronia con `create-athenea-app/bin/index.js`.
- Mantener Node 22 para la app de escritorio (`.nvmrc`, `.node-version`, engines de raiz).

## Convenciones de trabajo

- Commits: estilo Conventional Commits observado en historial (`feat:`, `fix:`, `chore:`, `docs:`).
- Husky esta instalado pero no hay hooks funcionales en raiz (`.husky/_` contiene wrappers); no depender de hooks para validar calidad.
- Priorizar cambios pequenos y verificables, sin alterar comportamiento existente.

## Skills del repositorio

| Skill                                          | Trigger de auto-invocacion                                                | Alcance         |
| ---------------------------------------------- | ------------------------------------------------------------------------- | --------------- |
| `skills/electron-ipc-contract/SKILL.md`        | Si se toca `src/main/**` o `src/preload/**` y hay IPC/seguridad/ventanas  | App Electron    |
| `skills/renderer-preact-routes/SKILL.md`       | Si se toca `src/renderer/**` (rutas, componentes, estilos)                | Renderer Preact |
| `skills/create-athenea-template-sync/SKILL.md` | Si se toca `create-athenea-app/bin/**` o `create-athenea-app/template/**` | CLI + template  |
| `skills/desktop-quality-gates/SKILL.md`        | Antes de cerrar cambios tecnicos o de documentacion operativa             | Validaciones    |

## Checklist obligatorio (salida)

- [ ] Revise el `AGENTS.md` mas cercano al archivo editado.
- [ ] Aplique la skill correspondiente segun trigger.
- [ ] Valide lint y typecheck/build segun scripts vigentes.
- [ ] Confirme que no hay contradicciones entre docs, skills y configuracion real.
- [ ] Documente riesgos o limitaciones detectadas.
