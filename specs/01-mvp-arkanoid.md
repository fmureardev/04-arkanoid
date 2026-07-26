# 01 - MVP Jugable de Arkanoid

**Estado:** Draft
**Dependencias:** Ninguna (primera spec del proyecto)
**Fecha:** 2026-07-26

**Objetivo:** Construir un Arkanoid jugable de un único nivel fijo (10 columnas x 6 filas de bloques) en un canvas de 800x600px, controlable con teclado y ratón, con puntuación, 3 vidas y pantallas de victoria/derrota, usando los assets existentes (`spritesheet.js`, sonidos) sin dependencias externas.

## Alcance

**Incluido en este MVP:**
- Un único nivel fijo, sin progresión a otros niveles.
- Canvas de 800x600px renderizado con Canvas 2D API.
- Pala controlable con teclado (flechas izquierda/derecha) y ratón (sigue al cursor horizontalmente).
- Bola con velocidad constante, rebote simple tipo espejo (ángulo de entrada = ángulo de salida) contra pala, paredes y bloques.
- Layout de bloques de 10 columnas x 6 filas, todos destructibles de un solo golpe, usando los sprites `block_<color>` existentes.
- Puntuación: +10 puntos por bloque destruido, visible en todo momento (HUD).
- Sistema de vidas: 3 vidas iniciales, visibles en todo momento (HUD).
- Al perder una vida (bola sale por abajo sin tocar la pala): se resetea la posición de la bola y la pala; los bloques restantes se mantienen.
- Condición de victoria: destruir todos los bloques del nivel → pantalla/mensaje de victoria.
- Condición de derrota: quedarse sin vidas → pantalla/mensaje de "Game Over".
- Sonido: `ball-bounce.mp3` al golpear la pala, `break-sound.mp3` al romper un bloque.
- El juego arranca automáticamente al cargar la página (sin pantalla de inicio ni botón "Start").

**Explícitamente fuera de alcance:**
- Power-ups de cualquier tipo.
- Múltiples niveles o progresión de niveles.
- Pausa del juego.
- Bloques que requieran más de un golpe o que otorguen puntuación distinta según color.
- Aceleración progresiva de la velocidad de la bola.
- Persistencia de puntuación (high scores) entre sesiones.
- Sonido de rebote contra paredes o bloques (solo pala y rotura de bloque, según lo confirmado).
- Responsive/adaptación a otros tamaños de pantalla distintos de 800x600.

## Modelo de datos

El estado del juego vive en memoria (variables JS), sin persistencia entre sesiones. Estructuras principales:

- **`paddle`**: `{ x, y, width, height, speed }`
  - `width: 100`, `height: 20`, posicionada cerca del borde inferior del canvas.
  - `x` se actualiza por teclado (flechas) o por la posición del ratón sobre el canvas.

- **`ball`**: `{ x, y, radius, dx, dy }`
  - `radius: 8`.
  - `dx`/`dy` representan la velocidad constante en cada eje; se invierten en los rebotes (espejo) contra pala, paredes y bloques.

- **`blocks`**: array de `{ x, y, width, height, color, alive }`
  - Generado al iniciar el nivel: 10 columnas x 6 filas (60 bloques).
  - `width: 80`, `height: 30` (bloques ocupan todo el ancho del canvas).
  - `color`: uno de los colores definidos en `SPRITES.blocks` (`red`, `yellow`, `green`, `cyan`, `magenta`, `hotpink`, `gray`), asignado por fila de forma cíclica.
  - `alive: true` al crearse; pasa a `false` al ser golpeado (deja de dibujarse y de colisionar).

- **`gameState`**: objeto simple con:
  - `score` (número, empieza en 0, +10 por bloque destruido).
  - `lives` (número, empieza en 3).
  - `status`: `'playing' | 'won' | 'lost'`, controla qué se dibuja en el HUD/overlay y si el loop sigue actualizando física.

No se introduce persistencia (localStorage, IndexedDB, etc.) en este MVP — todo el estado se pierde al recargar la página.

## Plan de implementación

1. **Esqueleto y render estático.** Crear `index.html` con un `<canvas id="game" width="800" height="600">`, cargar `assets/assets/spritesheet.js` y un nuevo `js/game.js`. Iniciar el loop con `loadSpritesheet` y dibujar en el canvas la pala, la bola y los 60 bloques (10x6) en sus posiciones iniciales, sin movimiento. *Verificable: al abrir `index.html` se ve la escena completa dibujada.*

2. **Movimiento de la pala.** Añadir listeners de teclado (flechas izquierda/derecha) y de `mousemove` sobre el canvas para actualizar `paddle.x`, con límites para no salir del canvas. *Verificable: la pala se mueve con teclado y ratón sin salirse de los bordes.*

3. **Movimiento de la bola y rebote en paredes.** Añadir el game loop (`requestAnimationFrame`) que actualiza `ball.x/y` según `dx/dy`, invirtiendo `dx` al chocar con los laterales y `dy` al chocar con el techo. Si la bola sobrepasa el borde inferior, por ahora solo se resetea su posición (sin restar vidas aún). *Verificable: la bola rebota indefinidamente en paredes y techo.*

4. **Colisión bola-pala.** Detectar colisión AABB/círculo entre `ball` y `paddle`, invertir `dy` (rebote espejo) y reproducir `ball-bounce.mp3`. *Verificable: la bola rebota en la pala con sonido; si falla, sigue cayendo (comportamiento del paso 3).*

5. **Colisión bola-bloques.** Detectar colisión entre la bola y cada bloque `alive`, marcar el bloque como `alive: false`, invertir `dy` (o `dx` según cara golpeada) en el rebote, sumar 10 a `score` y reproducir `break-sound.mp3`. *Verificable: los bloques desaparecen al ser golpeados y la bola rebota en ellos.*

6. **HUD de puntuación y vidas.** Dibujar `score` y `lives` en el canvas (texto superpuesto) en todo momento durante `status === 'playing'`. *Verificable: el HUD refleja los valores iniciales y se actualiza al romper bloques.*

7. **Pérdida de vida real.** Sustituir el reseteo simple del paso 3: al caer la bola por el borde inferior, restar 1 a `lives`, resetear posición/velocidad de `ball` y posición de `paddle`, manteniendo los bloques restantes. Si `lives` llega a 0, pasar `status` a `'lost'`. *Verificable: tras 3 caídas consecutivas sin tocar la pala, aparece el estado de derrota.*

8. **Condición de victoria y pantallas finales.** Comprobar tras cada bloque destruido si quedan bloques `alive`; si no quedan ninguno, pasar `status` a `'won'`. Al entrar en `status` `'won'` o `'lost'`, detener la actualización de física y mostrar un overlay/mensaje simple con el resultado y la puntuación final. *Verificable: romper todos los bloques muestra pantalla de victoria; perder las 3 vidas muestra pantalla de "Game Over".*

## Criterios de aceptación

- [ ] Al cargar `index.html` el juego arranca automáticamente, sin pantalla de inicio, mostrando la pala, la bola y los 60 bloques (10 columnas x 6 filas) en un canvas de 800x600px.
- [ ] La pala se mueve con las flechas de teclado izquierda/derecha.
- [ ] La pala se mueve siguiendo la posición horizontal del ratón sobre el canvas.
- [ ] La pala no puede salir de los límites del canvas por ningún método de control.
- [ ] La bola se mueve a velocidad constante y rebota (ángulo espejo) contra las paredes laterales y el techo.
- [ ] La bola rebota (ángulo espejo) al golpear la pala, reproduciendo `ball-bounce.mp3`.
- [ ] Al golpear un bloque, este desaparece, la bola rebota, se suman 10 puntos al marcador y se reproduce `break-sound.mp3`.
- [ ] La puntuación y las vidas restantes son visibles en pantalla en todo momento durante la partida.
- [ ] Si la bola sale por el borde inferior sin tocar la pala, se resta 1 vida y se resetean la posición de la bola y la pala, manteniendo los bloques restantes.
- [ ] Al llegar a 0 vidas, el juego muestra una pantalla/mensaje de "Game Over" con la puntuación final y detiene la partida.
- [ ] Al destruir los 60 bloques, el juego muestra una pantalla/mensaje de victoria con la puntuación final y detiene la partida.
- [ ] No se usa ningún framework, librería externa ni gestor de paquetes — solo HTML, CSS y JS puro, reutilizando `spritesheet.js` para el renderizado de sprites.

## Decisiones tomadas y descartadas

- **Rebote espejo simple en vez de ángulo por punto de impacto.** Se descartó el rebote "arcade" clásico (ángulo según dónde golpea la pala) por simplicidad en el MVP; puede añadirse en una spec futura de mejora de físicas si se desea más sensación de control.
- **Un único nivel fijo en vez de progresión de niveles.** Mantiene el MVP acotado; añadir niveles adicionales requeriría una spec propia (carga de layouts, transición entre niveles, persistencia de progreso).
- **Sin power-ups.** El spritesheet no incluye sprites de power-ups, y añadirlos implicaría diseño de nuevos assets y mecánicas — se deja fuera deliberadamente.
- **Bloques de un solo golpe, mismo valor de puntos.** Se descartó variar resistencia/puntuación por color para no complicar el modelo de datos ni el balanceo en esta primera versión.
- **Sin pausa.** Se prioriza tener el core loop jugable antes de añadir controles secundarios de estado.
- **Sin persistencia de puntuación.** No hay requisito de high scores en este MVP; se pierde el estado al recargar la página.
- **Arranque automático sin pantalla de inicio.** Simplifica el flujo para el MVP; una pantalla de "Start"/menú puede añadirse después sin afectar la lógica del juego ya construida.
