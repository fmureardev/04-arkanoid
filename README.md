# Juego de Arkanoid

Un juego de Arkanoid/Breakout construido con HTML, CSS y JavaScript puro — **cero dependencias**, sin build ni gestor de paquetes.

## Cómo jugar

Abre `index.html` en el navegador. El juego arranca automáticamente, sin pantalla de inicio.

- **Pala:** flechas izquierda/derecha del teclado, o mueve el ratón (sigue al cursor horizontalmente).
- **Pausa:** tecla `p`.
- **Objetivo:** destruye todos los bloques de cada nivel sin dejar caer la bola. Tienes 3 vidas.

## Funcionalidades implementadas

- Progresión de 3 niveles con distinta forma de bloques, cada uno un 15% más rápido que el anterior.
- Animación de explosión al destruir un bloque.
- Puntuación y vidas persistentes entre niveles, con pantallas de victoria/derrota.
- Sonido al golpear la pala y al romper un bloque.

Consulta `specs/` para el detalle y el histórico de cada funcionalidad.

## Estructura del proyecto

- `index.html` — punto de entrada, carga `js/game.js` y el spritesheet.
- `js/game.js` — lógica del juego.
- `assets/assets/` — spritesheet (`spritesheet-breakout.png`, `spritesheet.js`) y sonidos.
- `specs/` — specs del flujo de trabajo basado en `/spec` y `/spec-impl` (ver `CLAUDE.md`).
