# CLAUDE.md

Este fichero da instrucciones a Claude Code (claude.ai/code) para trabajar con el código de este repositorio.

## Estado del proyecto

Este es un juego de Arkanoid/Breakout que se construirá con HTML, CSS y JavaScript puro — **cero dependencias**. Por ahora el juego en sí todavía no está implementado; el repositorio solo contiene los assets del juego y el flujo de trabajo basado en specs usado para planificar y construir funcionalidades. No asumas que hay un sistema de build, gestor de paquetes o framework — no se usa ninguno.

## Assets

- `assets/assets/spritesheet-breakout.png` — spritesheet con la pala, la bola y los bloques.
- `assets/assets/spritesheet.js` — metadatos de los sprites (`SPRITES`, `EXPLOSION_FRAMES`) y las funciones de carga/dibujo (`loadSpritesheet`, `drawFrame`, `drawSprite`) usadas para pintar los sprites en un canvas. Los nombres de sprites de bloques siguen la convención `block_<color>` (p. ej. `block_red` → `SPRITES.blocks.red`).
- `assets/assets/sounds/` — `ball-bounce.mp3`, `break-sound.mp3`.
- `assets/__MACOSX/` son restos de la extracción del zip (ficheros AppleDouble `._*`) junto a la carpeta real `assets/assets/` — ignóralos, no los edites ni los referencies.

Al implementar el renderizado, reutiliza `drawSprite`/`drawFrame`/`loadSpritesheet` de `spritesheet.js` en vez de recalcular las coordenadas de los sprites.

## Flujo de trabajo basado en specs

Este repositorio usa un flujo de dos pasos basado en skills para construir funcionalidades (skills instaladas en `.agents/skills/` y `.claude/skills/`, registradas en `skills-lock.json`):

- **`/spec <funcionalidad>`** — diseñador guiado de specs. Aclara los requisitos mediante preguntas y luego escribe la spec sección por sección en `specs/NN-slug.md` (creada en estado `Draft`). Nunca escribe código.
- **`/spec-impl <NN-nombre-spec>`** — implementa una spec aprobada. Se niega a continuar a menos que el estado de la spec sea `Approved` (o una palabra equivalente en otro idioma). Al aprobarse, crea/cambia a una rama git `spec-NN-slug` (controlado por `AutoCreateBranch` en `specs/.spec-config.yml`, `true` por defecto) y luego implementa el plan paso a paso, deteniéndose para revisión después de cada paso.

Implicaciones prácticas para las sesiones de Claude Code en este repo:

- No escribas código del juego de forma especulativa — comprueba si existe un directorio `specs/` y si la spec correspondiente está `Approved` antes de implementar cualquier funcionalidad, por pequeña que sea.
- Si te piden planificar una nueva funcionalidad, prioriza invocar `/spec` en vez de planificar de forma ad hoc.
- Si te piden implementar una funcionalidad que ya tiene una spec aprobada, prioriza `/spec-impl` para mantener consistencia en el nombrado de ramas y en la revisión paso a paso con el resto del proyecto.
- Una vez aprobadas, las specs son la fuente de verdad sobre alcance y criterios de aceptación — implementa lo que diga la spec; señala los desacuerdos como observaciones en vez de desviarte en silencio.
