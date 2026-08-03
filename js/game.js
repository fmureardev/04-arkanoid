const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const BLOCK_COLORS = [ 'red', 'yellow', 'green', 'cyan', 'magenta', 'hotpink', 'gray' ];
const BLOCK_COLS = 10;
const BLOCK_ROWS = 6;
const BLOCK_WIDTH = 80;
const BLOCK_HEIGHT = 30;
const BLOCK_TOP_OFFSET = 50;

const paddle = {
  x: ( canvas.width - 100 ) / 2,
  y: canvas.height - 40,
  width: 100,
  height: 20,
  speed: 8,
};

const ball = {
  x: paddle.x + paddle.width / 2,
  y: paddle.y - 8 - 1,
  radius: 8,
  dx: 3,
  dy: -3,
};

function createBlocks() {
  const list = [];
  for ( let row = 0; row < BLOCK_ROWS; row++ ) {
    for ( let col = 0; col < BLOCK_COLS; col++ ) {
      list.push( {
        x: col * BLOCK_WIDTH,
        y: BLOCK_TOP_OFFSET + row * BLOCK_HEIGHT,
        width: BLOCK_WIDTH,
        height: BLOCK_HEIGHT,
        color: BLOCK_COLORS[ row % BLOCK_COLORS.length ],
        alive: true,
      } );
    }
  }
  return list;
}

const blocks = createBlocks();

const gameState = {
  score: 0,
  lives: 3,
  status: 'playing',
};

function draw() {
  ctx.clearRect( 0, 0, canvas.width, canvas.height );

  blocks.forEach( block => {
    if ( !block.alive ) return;
    drawSprite( ctx, `block_${ block.color }`, block.x, block.y, block.width, block.height );
  } );

  drawSprite( ctx, 'paddle', paddle.x, paddle.y, paddle.width, paddle.height );
  drawSprite( ctx, 'ball', ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2 );

  if ( gameState.status === 'playing' ) drawHUD();
}

function drawHUD() {
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.textBaseline = 'top';

  ctx.textAlign = 'left';
  ctx.strokeText( `Puntuación: ${ gameState.score }`, 10, 10 );
  ctx.fillText( `Puntuación: ${ gameState.score }`, 10, 10 );

  ctx.textAlign = 'right';
  ctx.strokeText( `Vidas: ${ gameState.lives }`, canvas.width - 10, 10 );
  ctx.fillText( `Vidas: ${ gameState.lives }`, canvas.width - 10, 10 );
}

const keys = { ArrowLeft: false, ArrowRight: false };

document.addEventListener( 'keydown', e => {
  if ( e.key in keys ) keys[ e.key ] = true;
} );

document.addEventListener( 'keyup', e => {
  if ( e.key in keys ) keys[ e.key ] = false;
} );

canvas.addEventListener( 'mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  paddle.x = clampPaddleX( mouseX - paddle.width / 2 );
} );

function clampPaddleX( x ) {
  return Math.max( 0, Math.min( canvas.width - paddle.width, x ) );
}

const ballBounceSound = new Audio( 'assets/assets/sounds/ball-bounce.mp3' );
const breakSound = new Audio( 'assets/assets/sounds/break-sound.mp3' );

function playSound( audio ) {
  audio.currentTime = 0;
  audio.play();
}

function resetBall() {
  ball.x = paddle.x + paddle.width / 2;
  ball.y = paddle.y - ball.radius - 1;
  ball.dx = 3;
  ball.dy = -3;
}

function collidesWithPaddle() {
  return ball.dy > 0 &&
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddle.height &&
    ball.x + ball.radius >= paddle.x &&
    ball.x - ball.radius <= paddle.x + paddle.width;
}

function checkBlockCollision() {
  for ( const block of blocks ) {
    if ( !block.alive ) continue;

    const closestX = Math.max( block.x, Math.min( ball.x, block.x + block.width ) );
    const closestY = Math.max( block.y, Math.min( ball.y, block.y + block.height ) );
    const distX = ball.x - closestX;
    const distY = ball.y - closestY;

    if ( distX * distX + distY * distY > ball.radius * ball.radius ) continue;

    block.alive = false;
    gameState.score += 10;
    playSound( breakSound );

    const overlapX = Math.min( ball.x + ball.radius - block.x, block.x + block.width - ( ball.x - ball.radius ) );
    const overlapY = Math.min( ball.y + ball.radius - block.y, block.y + block.height - ( ball.y - ball.radius ) );
    if ( overlapX < overlapY ) {
      ball.dx = -ball.dx;
    } else {
      ball.dy = -ball.dy;
    }
    break;
  }
}

function updateBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if ( ball.x - ball.radius < 0 ) {
    ball.x = ball.radius;
    ball.dx = -ball.dx;
  } else if ( ball.x + ball.radius > canvas.width ) {
    ball.x = canvas.width - ball.radius;
    ball.dx = -ball.dx;
  }

  if ( ball.y - ball.radius < 0 ) {
    ball.y = ball.radius;
    ball.dy = -ball.dy;
  }

  checkBlockCollision();

  if ( collidesWithPaddle() ) {
    ball.y = paddle.y - ball.radius;
    ball.dy = -ball.dy;
    playSound( ballBounceSound );
  }

  if ( ball.y - ball.radius > canvas.height ) {
    resetBall();
  }
}

function update() {
  if ( keys.ArrowLeft ) paddle.x = clampPaddleX( paddle.x - paddle.speed );
  if ( keys.ArrowRight ) paddle.x = clampPaddleX( paddle.x + paddle.speed );

  updateBall();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame( gameLoop );
}

loadSpritesheet( gameLoop );
