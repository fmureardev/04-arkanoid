# 03 - Niveles con progresión

**Estado:** Draft
**Dependencias:** 01-mvp-arkanoid (Implementado), 02-animacion-destruccion-bloques (Implementado)
**Fecha:** 2026-08-03

**Objetivo:** Añadir progresión de 3 niveles fijos con distinta forma de bloques, donde cada nivel incrementa la velocidad de la bola un 15% respecto al anterior, manteniendo vidas y puntuación acumuladas, y mostrando una pantalla final de "Completaste el juego" tras el tercer nivel.

## Alcance

**Incluido:**
- 3 niveles fijos con layouts de bloques distintos, en la misma rejilla de 10 columnas x 6 filas:
  - Nivel 1: rejilla completa (60 bloques, igual que el MVP actual).
  - Nivel 2: forma de pirámide/triángulo invertido.
  - Nivel 3: forma de diamante.
- Progresión automática: al destruir todos los bloques `alive` de un nivel que no sea el último, se avanza al siguiente.
- Overlay breve (~1.5s) mostrando el número del nivel alcanzado (p. ej. "Nivel 2"), tras el cual el juego continúa automáticamente sin input del jugador.
- Incremento de velocidad de la bola del 15% por nivel, de forma acumulativa/compuesta (nivel 2 = base × 1.15, nivel 3 = base × 1.15²).
- Vidas y puntuación se mantienen acumuladas entre niveles (no se resetean al cambiar de nivel).
- Al cambiar de nivel, se resetean la posición de la bola y de la pala a sus posiciones iniciales (igual que ocurre hoy al perder una vida), aplicando la nueva velocidad correspondiente al nivel.
- Colores de bloques asignados por fila de forma cíclica, igual que en el MVP actual (sin colores fijos por nivel).
- Al completar el tercer nivel (destruir todos sus bloques), se muestra una pantalla/mensaje de "Completaste el juego" con la puntuación final, deteniendo la partida (sustituye a la pantalla de victoria genérica del MVP).
- **Pausa del juego con la tecla `p`:** al pulsarla durante `status === 'playing'`, el juego se pausa (bola, pala y física dejan de actualizarse) y se muestra un overlay indicando que está en pausa. Al volver a pulsar `p`, se reanuda desde donde estaba, sin resetear nada.

**Explícitamente fuera de alcance:**
- Más de 3 niveles o generación procedural de niveles.
- Variar el número de filas/columnas por nivel (siempre 10x6).
- Colores fijos o temáticos por nivel.
- Persistencia del nivel/progreso entre sesiones (recargar la página vuelve a empezar en el nivel 1 con 3 vidas y 0 puntos).
- Posibilidad de saltar niveles, seleccionar nivel de inicio, o volver a un nivel anterior.
- Cualquier cambio en las mecánicas de pérdida de vida (spec 01) o en la animación de explosión de bloques (spec 02) más allá de reiniciar bola/pala al cambiar de nivel.
- Requerir input del jugador para avanzar tras el overlay de nivel (es automático).
- Pausar durante el overlay de transición de nivel, la pantalla de "Game Over" o la de "Completaste el juego" (la tecla `p` solo tiene efecto durante `status === 'playing'`).
- Menú de pausa con opciones (reiniciar, salir, ajustes, etc.) — solo pausa/reanuda.

## Modelo de datos

Se introduce la definición de niveles y se extiende `gameState` con el nivel actual y el estado de pausa. No se modifica la estructura de `paddle`, `ball` ni `activeExplosions` definidas en specs anteriores.

- **`LEVELS`**: array fijo de 3 definiciones de nivel (constante, no cambia en tiempo de ejecución).
  - Cada elemento es una matriz booleana de 6 filas x 10 columnas (`true` = hay bloque, `false` = hueco), usada para generar el array `blocks` al iniciar el nivel:
    - `LEVELS[0]`: todas las celdas `true` (rejilla completa).
    - `LEVELS[1]`: patrón de pirámide/triángulo invertido (más bloques arriba, menos abajo, centrados).
    - `LEVELS[2]`: patrón de diamante (menos bloques en las filas extremas, más en las centrales).

- **`gameState`** (extendido respecto a la spec 01):
  - `currentLevel` (número, empieza en `1`, valores posibles `1`, `2`, `3`).
  - `status`: se añaden los valores `'levelTransition'` y `'paused'` a los ya existentes (`'playing' | 'won' | 'lost' | 'levelTransition' | 'paused'`).
    - `'levelTransition'`: activo durante el overlay de ~1.5s entre niveles.
    - `'paused'`: activo mientras el juego está en pausa por la tecla `p`.
  - `score` y `lives` se mantienen con el mismo significado que en la spec 01 (no se resetean al cambiar de nivel).

- **`ball.speed` (velocidad base)**: se calcula al iniciar cada nivel como `baseSpeed × 1.15^(currentLevel - 1)`, donde `baseSpeed` es la velocidad constante definida en la spec 01. Se aplica a `dx`/`dy` al resetear la bola en cada cambio de nivel, conservando la dirección/ángulo con el que se resetea normalmente.

- **`blocks`**: se sigue generando igual que en la spec 01 (mismo `width`, `height`, asignación cíclica de `color` por fila), pero ahora solo se crea un bloque `alive: true` en las celdas donde `LEVELS[currentLevel - 1]` sea `true`; el resto de celdas simplemente no generan bloque.

No se introduce ningún campo adicional para la pausa más allá del valor `'paused'` en `status`: como la física ya deja de actualizarse comprobando `status === 'playing'` (igual que hoy con `'won'`/`'lost'`), pausar y reanudar no requiere guardar ni restaurar ningún otro dato.

## Plan de implementación

1. **Definir `LEVELS` y generar bloques desde el patrón.** Declarar la constante `LEVELS` con las 3 matrices booleanas (rejilla completa, pirámide, diamante). Modificar la generación de `blocks` para que recorra `LEVELS[currentLevel - 1]` y solo cree un bloque en las celdas `true`. Añadir `currentLevel = 1` a `gameState`, inicializado al arrancar el juego. *Verificable: al cargar la página se sigue viendo el nivel 1 (rejilla completa) exactamente igual que antes.*

2. **Cambiar temporalmente a nivel 2 o 3 para verificar patrones.** (Paso de verificación manual, sin cambio de UX todavía) Forzar puntualmente `currentLevel = 2` o `3` al iniciar para comprobar visualmente que las formas de pirámide y diamante se generan correctamente sobre la rejilla 10x6, luego revertir a `currentLevel = 1`. *Verificable: cada patrón se ve como una pirámide/diamante reconocible sobre la rejilla.*

3. **Detectar fin de nivel y avanzar `currentLevel`.** En el punto donde hoy se detecta "no quedan bloques `alive`" (condición de victoria de la spec 01), diferenciar: si `currentLevel < 3`, incrementar `currentLevel`, regenerar `blocks` con el nuevo patrón, resetear `ball` y `paddle` aplicando la nueva velocidad (`baseSpeed × 1.15^(currentLevel - 1)`), sin resetear `score` ni `lives`. Si `currentLevel === 3`, mantener el comportamiento de victoria pero mostrando "Completaste el juego" en vez del mensaje genérico. *Verificable: al destruir todos los bloques del nivel 1, aparecen los bloques del nivel 2 y la bola se mueve más rápido; al completar el nivel 3, aparece la pantalla de "Completaste el juego".*

4. **Overlay de transición entre niveles.** Añadir el estado `'levelTransition'`: al pasar de nivel (excepto al completar el nivel 3), poner `status = 'levelTransition'`, detener la actualización de física, dibujar un overlay con el texto del nivel alcanzado (p. ej. "Nivel 2") y, tras ~1.5s (con `setTimeout` o comprobando tiempo transcurrido en el loop), volver `status` a `'playing'` sin input del jugador. *Verificable: al pasar de nivel se ve el mensaje del nuevo nivel durante ~1.5s, la bola/pala no se mueven durante ese tiempo, y luego el juego continúa solo.*

5. **Pantalla final "Completaste el juego".** Sustituir/ajustar la pantalla de victoria existente (spec 01) para que, cuando se complete el nivel 3, muestre el texto "Completaste el juego" junto con la puntuación final acumulada, deteniendo la partida igual que hoy. *Verificable: jugar los 3 niveles completos termina mostrando este mensaje con la puntuación total correcta.*

6. **Pausa con la tecla `p`.** Añadir un listener de teclado para `p` que, si `status === 'playing'`, cambia `status` a `'paused'` y detiene la actualización de física; si `status === 'paused'`, vuelve a `'playing'` sin resetear nada. Dibujar un overlay simple ("Pausa") mientras `status === 'paused'`. La tecla `p` no tiene efecto en ningún otro `status`. *Verificable: pulsar `p` durante la partida congela la bola/pala y muestra el overlay de pausa; pulsar `p` de nuevo reanuda exactamente donde estaba.*

## Criterios de aceptación

- [ ] El juego arranca en el nivel 1 con la rejilla completa de 60 bloques (10x6), igual que el MVP actual.
- [ ] Al destruir todos los bloques del nivel 1, se avanza automáticamente al nivel 2 con el patrón de pirámide/triángulo invertido.
- [ ] Al destruir todos los bloques del nivel 2, se avanza automáticamente al nivel 3 con el patrón de diamante.
- [ ] La velocidad de la bola en el nivel 2 es un 15% mayor que en el nivel 1, y en el nivel 3 un 15% mayor que en el nivel 2 (compuesto, ≈32.25% mayor que el nivel 1).
- [ ] Al cambiar de nivel, se muestra un overlay con el número de nivel alcanzado durante ~1.5s, durante el cual la bola y la pala no se mueven, y después el juego continúa solo sin necesidad de pulsar nada.
- [ ] Las vidas y la puntuación no se resetean al cambiar de nivel; se mantienen acumuladas de principio a fin.
- [ ] Al cambiar de nivel, la posición de la bola y de la pala se resetean a sus posiciones iniciales, con la nueva velocidad correspondiente al nivel.
- [ ] Al destruir todos los bloques del nivel 3, se muestra una pantalla con el texto "Completaste el juego" y la puntuación final acumulada, deteniendo la partida.
- [ ] Perder todas las vidas en cualquier nivel (1, 2 o 3) sigue mostrando la pantalla de "Game Over" con la puntuación final, igual que en el MVP.
- [ ] Los colores de los bloques se siguen asignando por fila de forma cíclica en los 3 niveles, sin colores fijos por nivel.
- [ ] Recargar la página siempre reinicia el juego en el nivel 1 con 3 vidas y 0 puntos (sin persistencia de progreso).
- [ ] Pulsar `p` durante la partida (`status === 'playing'`) pausa el juego: la bola y la pala dejan de moverse y se muestra un overlay de pausa.
- [ ] Pulsar `p` de nuevo mientras está en pausa reanuda la partida exactamente donde estaba, sin resetear posiciones, vidas ni puntuación.
- [ ] La tecla `p` no tiene ningún efecto durante el overlay de transición de nivel, ni en las pantallas de "Game Over" o "Completaste el juego".
- [ ] No se introduce ninguna dependencia externa ni framework — solo HTML, CSS y JS puro.

## Decisiones tomadas y descartadas

- **3 niveles fijos hardcodeados en vez de generación procedural.** Mantiene el alcance acotado y verificable; una generación procedural de niveles requeriría su propia spec de diseño de algoritmo.
- **Mismo grid 10x6 para los 3 niveles, variando solo qué celdas tienen bloque.** Simplifica el modelo de datos (reutiliza `width`/`height` de la spec 01) y evita tener que recalcular layouts con distinto número de filas/columnas.
- **Incremento de velocidad compuesto (15% sobre el nivel anterior) en vez de tabla fija de velocidades.** Es una fórmula simple y fácil de razonar (`baseSpeed × 1.15^(nivel-1)`), y escala igual de bien si en el futuro se añaden más niveles.
- **Vidas y puntuación acumuladas entre niveles, sin resetear.** Refuerza la sensación de progresión continua; resetear vidas por nivel penalizaría innecesariamente y no fue pedido.
- **Overlay de transición automático (sin requerir input) en vez de pantalla con botón "Continuar".** Mantiene el ritmo del juego sin fricción; pedir una pulsación para avanzar de nivel no aporta valor aquí.
- **Colores por fila cíclicos, sin colores fijos por nivel.** Mantiene consistente el comportamiento ya validado en la spec 01 y evita tener que definir una paleta nueva por nivel.
- **Pausa incluida en esta misma spec en vez de una spec aparte.** Aunque es una funcionalidad conceptualmente independiente (y explícitamente fuera de alcance en la spec 01), el usuario prefirió incluirla aquí por ser un cambio pequeño y contenido (un nuevo `status` y un listener de teclado).
- **Pausa sin menú de opciones, solo pausa/reanuda con la misma tecla.** Mantiene la implementación mínima; un menú de pausa con más opciones (reiniciar, salir) queda fuera de lo pedido.
- **La pausa solo funciona durante `status === 'playing'`.** Evita casos raros como pausar en mitad del overlay de transición de nivel o de las pantallas finales, donde no tendría sentido o podría dejar el juego en un estado inconsistente.
