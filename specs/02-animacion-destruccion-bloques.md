# 02 - Animación de destrucción de bloques

**Estado:** Draft
**Dependencias:** 01-mvp-arkanoid (Implementado)
**Fecha:** 2026-08-03

**Objetivo:** Al destruir un bloque, mostrar una animación de explosión no bloqueante de 4 frames (usando `EXPLOSION_FRAMES` de `spritesheet.js`) en su posición, sin afectar la física ni el resto del juego.

## Alcance

**Incluido:**
- Animación de explosión de 4 frames al destruir cualquier bloque, usando `EXPLOSION_FRAMES[color]` de `spritesheet.js`.
- Reproducción no bloqueante: la física del juego (bola, pala, otros bloques) sigue funcionando con normalidad mientras la animación se reproduce.
- Soporte para múltiples animaciones simultáneas, sin límite explícito.
- Duración total de la animación = `EXPLOSION_DURATION` (150ms), repartida entre los 4 frames (~37.5ms cada uno).
- El bloque deja de existir/colisionar en el instante del golpe (como ya ocurre hoy); la animación es puramente visual sobre el hueco vacío.
- Se mantiene `break-sound.mp3` reproduciéndose en el mismo instante que hoy (al golpear el bloque), sin cambios de audio.

**Explícitamente fuera de alcance:**
- Cualquier sonido nuevo o distinto para la explosión.
- Cambios en la lógica de colisión bola-bloque (el hueco nunca vuelve a ser sólido durante la animación).
- Animaciones de destrucción para la pala o la bola.
- Efectos de partículas, fragmentos o física adicional más allá de los frames del spritesheet.
- Límite máximo de animaciones simultáneas.

## Modelo de datos

Se introduce un único array nuevo, sin persistencia entre sesiones:

- **`activeExplosions`**: array de objetos `{ x, y, width, height, color, startTime }`
  - Se añade un elemento cada vez que un bloque pasa a `alive: false` por colisión con la bola.
  - `x, y, width, height`: mismas coordenadas y tamaño que tenía el bloque destruido (reutilizadas para posicionar la animación).
  - `color`: el mismo `color` del bloque destruido, usado para indexar `EXPLOSION_FRAMES[color]`.
  - `startTime`: timestamp (`performance.now()` o el `timestamp` del `requestAnimationFrame`) en el que se disparó la explosión, usado para calcular qué frame tocar.
  - Cada animación se elimina del array cuando transcurre `EXPLOSION_DURATION` desde su `startTime`.

No se modifica la estructura existente de `block` ni de `gameState`.

## Plan de implementación

1. **Añadir `activeExplosions` y disparar animación al destruir un bloque.** Declarar `let activeExplosions = []` junto al resto del estado del juego. En el punto donde hoy se hace `block.alive = false` (colisión bola-bloque), añadir un nuevo objeto `{ x: block.x, y: block.y, width: block.width, height: block.height, color: block.color, startTime: <timestamp actual> }` a `activeExplosions`. *Verificable: aunque aún no se vea nada nuevo en pantalla, se puede comprobar por consola que el array crece al romper bloques.*

2. **Calcular y dibujar el frame correspondiente en el render loop.** En la función de dibujo, recorrer `activeExplosions`; para cada una, calcular `elapsed = timestamp - startTime`, `frameIndex = Math.floor(elapsed / (EXPLOSION_DURATION / 4))` (clamp a 0–3), y dibujar `EXPLOSION_FRAMES[color][frameIndex]` con `drawFrame` en `(x, y, width, height)`. *Verificable: al romper un bloque se ve la secuencia de 4 frames de explosión en su posición.*

3. **Purgar animaciones terminadas.** Tras dibujar (o al inicio del frame de actualización), filtrar `activeExplosions` eliminando las que tengan `elapsed >= EXPLOSION_DURATION`. *Verificable: la explosión desaparece del todo pasados los ~150ms, dejando el hueco vacío; romper varios bloques seguidos no acumula animaciones "fantasma".*

## Criterios de aceptación

- [ ] Al destruir un bloque, se reproduce en su posición una animación de 4 frames usando `EXPLOSION_FRAMES[color]` del bloque destruido.
- [ ] La animación completa dura aproximadamente `EXPLOSION_DURATION` (150ms), repartidos entre los 4 frames.
- [ ] Mientras se reproduce la animación, la bola, la pala y el resto de bloques se siguen moviendo y actualizando con normalidad (no hay pausa ni bloqueo).
- [ ] Es posible ver varias animaciones de explosión reproduciéndose a la vez si se destruyen varios bloques en un intervalo corto.
- [ ] El hueco de un bloque destruido nunca vuelve a colisionar con la bola, ni durante ni después de la animación.
- [ ] `break-sound.mp3` se sigue reproduciendo al golpear el bloque, igual que en el MVP actual (sin cambios de audio).
- [ ] Al terminar la animación, no queda ningún resto visual del bloque ni de la explosión en esa posición.
- [ ] No se introduce ninguna dependencia externa ni framework — solo se usan `EXPLOSION_FRAMES`, `EXPLOSION_DURATION` y `drawFrame` ya existentes en `spritesheet.js`.

## Decisiones tomadas y descartadas

- **Animación no bloqueante en vez de pausar la física.** Se prioriza que el juego se sienta fluido incluso rompiendo varios bloques seguidos; pausar la física por cada explosión generaría microcortes molestos.
- **`EXPLOSION_DURATION` como duración total repartida entre 4 frames, no por frame.** Con 150ms por frame la animación total duraría 600ms, demasiado lenta para el ritmo del juego; se interpreta como duración total (~37.5ms/frame) para que se sienta rápida y no distraiga de la jugabilidad.
- **Array `activeExplosions` independiente en vez de estado dentro de `block`.** Mantiene `block` simple (igual que en la spec 01) y separa claramente las responsabilidades: `blocks` es el estado de colisión/juego, `activeExplosions` es puramente visual y efímero.
- **Sin límite de animaciones simultáneas.** El número máximo de bloques (60) es lo bastante bajo como para que no haya problema de rendimiento aunque se destruyan varios a la vez.
- **El hueco deja de colisionar inmediatamente, no al terminar la animación.** Se mantiene el comportamiento de colisión ya validado en el MVP (spec 01); cambiarlo sería una modificación de física no solicitada.
- **Sin sonido nuevo para la explosión.** Se mantiene `break-sound.mp3` tal cual; añadir un sonido distinto queda fuera del alcance pedido.
