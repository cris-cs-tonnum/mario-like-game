const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const GROUND_Y = (canvas.height * 0.75) - 65;
const earthio = {
    x: canvas.width/ 2 - 500,
    y: GROUND_Y,
   width: 32,
   height: 32,
    speed: 5,
    dx: 0,
    dy: 0,
    velocityY: 0,
    isJumping: false,
    jumpPower: 15,
    gravity: 0.6
};

let lastKey = null;
const keys = {
    left: false,
    right: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
        lastKey = 'left';
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = true;
        lastKey = 'right';
    }
     if ((e.key === ' ' || e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') && !earthio.isJumping) {
        earthio.velocityY = -earthio.jumpPower;
        earthio.isJumping = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = false;
        if (keys.right) lastKey = 'right';
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = false;
        if (keys.left) lastKey = 'left';
    }
});

function update() {

     earthio.dx = 0;

if (lastKey === 'left' && keys.left) earthio.dx = -earthio.speed;
if (lastKey === 'right' && keys.right) earthio.dx = earthio.speed;
    earthio.x += earthio.dx;

      if (earthio.isJumping) {
        earthio.velocityY += earthio.gravity;
        earthio.y += earthio.velocityY;

        if (earthio.y >= GROUND_Y) {
            earthio.y = GROUND_Y;
            earthio.velocityY = 0;
            earthio.isJumping = false;
        }
    }

    if (earthio.x < 0) earthio.x = 0;
    if (earthio.x + earthio.width > canvas.width) {
        earthio.x = canvas.width - earthio.width;
}
}
function draw() {
    ctx.fillStyle = 'skyblue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //player
    ctx.fillStyle = 'white';
ctx.fillRect(earthio.x, earthio.y, earthio.width, earthio.height);


//floor
      ctx.fillStyle = '#555555';
    ctx.fillRect(
        0,
        GROUND_Y + earthio.height,
        canvas.width,
        canvas.height - (GROUND_Y + earthio.height)
    );
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
