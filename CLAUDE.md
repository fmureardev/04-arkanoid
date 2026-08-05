# CLAUDE.md

Este fichero da instrucciones a Claude Code (claude.ai/code) para trabajar con el código de este repositorio.

## Estado del proyecto

Este es un juego de Arkanoid/Breakout construido con HTML, CSS y JavaScript puro — **cero dependencias**. No asumas que hay un sistema de build, gestor de paquetes o framework — no se usa ninguno; `index.html` carga `js/game.js` y `assets/assets/spritesheet.js` directamente vía `<script>`.

El juego se ha ido construyendo incrementalmente mediante el flujo de specs descrito abajo. Estado actual (ver `specs/` para el detalle de cada una):

- `01-mvp-arkanoid` (Implementado): MVP jugable de un nivel fijo, con pala, bola, bloques, puntuación y vidas.
- `02-animacion-destruccion-bloques` (Implementado): animación de explosión al destruir bloques.
- `03-niveles-y-pausa` (Implementado): progresión de 3 niveles con velocidad creciente y pausa con `p`.

No confíes en este resumen como fuente de verdad sobre el alcance exacto de cada funcionalidad — lee la spec correspondiente en `specs/` y comprueba su campo `Estado` antes de asumir que algo está implementado o de modificarlo.

## Assets

- `assets/assets/spritesheet-breakout.png` — spritesheet con la pala, la bola y los bloques.
- `assets/assets/spritesheet.js` — metadatos de los sprites (`SPRITES`, `EXPLOSION_FRAMES`) y las funciones de carga/dibujo (`loadSpritesheet`, `drawFrame`, `drawSprite`) usadas para pintar los sprites en un canvas. Los nombres de sprites de bloques siguen la convención `block_<color>` (p. ej. `block_red` → `SPRITES.blocks.red`).
- `assets/assets/sounds/` — `ball-bounce.mp3`, `break-sound.mp3`.
- `assets/__MACOSX/` son restos de la extracción del zip (ficheros AppleDouble `._*`) junto a la carpeta real `assets/assets/` — ignóralos, no los edites ni los referencies.

Al implementar el renderizado, reutiliza `drawSprite`/`drawFrame`/`loadSpritesheet` de `spritesheet.js` en vez de recalcular las coordenadas de los sprites.

## Flujo de trabajo basado en specs

Este repositorio usa un flujo de dos pasos basado en skills para construir funcionalidades (skills reales en `.agents/skills/spec` y `.agents/skills/spec-impl`, enlazadas simbólicamente desde `.claude/skills/`, registradas en `skills-lock.json`).

### `/spec <funcionalidad>` — diseño guiado de la spec

Nunca escribe código. Sigue cuatro fases en orden estricto:

1. **Contexto**: lee `CLAUDE.md`, lista `specs/` y revisa las 2 specs más recientes para adoptar las convenciones del proyecto.
2. **Preguntas**: aclara ambigüedades en bloques de 3-5 preguntas (alcance, modelo de datos, integración con specs previas, persistencia, estados UX, riesgos, decisiones ya cerradas) antes de escribir nada.
3. **Redacción sección por sección**, con confirmación del usuario tras cada una, siguiendo `.agents/skills/spec/template.md`: Cabecera (estado/dependencias/fecha/objetivo en una frase) → Alcance (incluido y explícitamente fuera) → Modelo de datos → Plan de implementación (pasos numerados) → Criterios de aceptación (checklist verificable) → Decisiones tomadas y descartadas → Riesgos (si aplica).
4. **Guardado**: numeración secuencial `specs/NN-slug.md` (siguiente número tras la última spec existente), estado inicial siempre `Draft` — nunca se auto-aprueba. Si `specs/.spec-config.yml` no existe, lo crea con `AutoCreateBranch: true` por defecto.

### `/spec-impl <NN-nombre-spec>` — implementación de una spec aprobada

Cuatro fases, cada una bloqueante si la anterior no se cumple:

1. **Localizar la spec** en `specs/` (acepta nombre completo, solo número o solo slug).
2. **Validar estado**: solo continúa si el campo de estado significa "Aprobado" en cualquier idioma (`Approved`, `Aprobado`, …). `Draft`/`Borrador`, `En revisión`, `Implementado` o cualquier valor no reconocido detienen el flujo con un mensaje de error estándar — nunca se ofrece continuar igualmente.
3. **Rama git**: deriva `spec-NN-slug` del nombre del fichero. Si `AutoCreateBranch` es `true` (por defecto en `specs/.spec-config.yml`), crea/cambia de rama sin preguntar; si es `false`, pide confirmación `[y/N]` antes de tocar git. Después muestra objetivo, alcance, plan y criterios de aceptación de la spec.
4. **Implementación paso a paso**: un paso del plan a la vez, mostrando el diff y esperando confirmación explícita antes de continuar. Ante ambigüedad no resuelta por la spec, se detiene y presenta 2-3 opciones concretas en vez de improvisar. Al terminar el último paso, recuerda verificar los criterios de aceptación uno a uno y actualizar el estado de la spec a `Implementado` antes del merge.

### Implicaciones prácticas para las sesiones de Claude Code en este repo

- No escribas código del juego de forma especulativa — comprueba si existe una spec para la funcionalidad y si su estado es `Approved`/`Aprobado` antes de implementar nada, por pequeño que sea.
- Si te piden planificar una nueva funcionalidad, prioriza invocar `/spec` en vez de planificar de forma ad hoc.
- Si te piden implementar una funcionalidad que ya tiene una spec aprobada, prioriza `/spec-impl` para mantener consistencia en el nombrado de ramas y en la revisión paso a paso con el resto del proyecto.
- Una vez aprobadas, las specs son la fuente de verdad sobre alcance y criterios de aceptación — implementa lo que diga la spec; señala los desacuerdos como observaciones en vez de desviarte en silencio.
- Antes de tocar una funcionalidad existente, relee la spec correspondiente en `specs/` en vez de inferir el comportamiento esperado solo a partir del código.
