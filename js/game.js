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

function resetBall() {
  ball.x = paddle.x + paddle.width / 2;
  ball.y = paddle.y - ball.radius - 1;
  ball.dx = 3;
  ball.dy = -3;
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
