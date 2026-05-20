// CANVAS
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// IMAGES
const horse = document.getElementById('whitehorse');

const walkFrames = [
    document.getElementById('walk1'),
    document.getElementById('walk2'),
    document.getElementById('walk3')
];


// ANIMATION
let currentFrame = 0;
let frameTimer = 0;
let facingLeft = false;
let bubbleTime = 0;


// FAIL TIMER (NEW)
let failTimer = 0;


// GROUND
const GROUND_Y = canvas.height * 0.75;


// GAME STATE
let round = 1;
let dodged = 0;

const DODGES_PER_ROUND = [0, 5, 8, 12, 15, 18];
let gameState = 'playing';


// PLAYER
const earthio = {
    x: canvas.width / 2,
    y: GROUND_Y - 120,
    width: 120,
    height: 120,
    speed: 5,
    dx: 0,
    velocityY: 0,
    isJumping: false,
    jumpPower: 15,
    gravity: 0.6
};


// SOAPS
let soaps = [];
let soapTimer = -60;

function getSoapInterval() {
    return Math.max(40, 90 - round * 10);
}

// slower in round 4 & 5
function getSoapSpeed() {
    if (round >= 4) return 3 + round * 0.6;
    return 3 + round * 1.2;
}

function spawnSoap() {
    const size = 35 + Math.random() * 20;

    soaps.push({
        x: canvas.width + size * 1.6,
        y: GROUND_Y - size,
        size,
        speed: getSoapSpeed(),
        dodged: false
    });
}


// DRAW SOAP
function drawSoap(soap) {
    const { x, y, size } = soap;
    const w = size * 1.6;
    const h = size;
    const r = 10;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    ctx.fillStyle = '#ff85c0';
    ctx.fill();

    ctx.fillStyle = '#cc3399';
    ctx.font = `bold ${size * 0.28}px Georgia`;
    ctx.textAlign = 'center';
    ctx.fillText('SOAP', x + w / 2, y + h / 2);
    ctx.textAlign = 'left';
}


function drawGirl(cx, cy) {

    // DRESS (pink)
    ctx.beginPath();
    ctx.moveTo(cx, cy - 60);
    ctx.bezierCurveTo(cx - 80, cy - 20, cx - 100, cy + 80, cx - 60, cy + 150);
    ctx.lineTo(cx + 60, cy + 150);
    ctx.bezierCurveTo(cx + 100, cy + 80, cx + 80, cy - 20, cx, cy - 60);

    ctx.fillStyle = '#ff69b4';
    ctx.fill();
    ctx.strokeStyle = '#cc3377';
    ctx.lineWidth = 2;
    ctx.stroke();

    // HEAD
    ctx.beginPath();
    ctx.arc(cx, cy - 140, 38, 0, Math.PI * 2);
    ctx.fillStyle = '#fddbb4';
    ctx.fill();

    // HAIR (✨ BRONDE / GOLDEN BROWN)
    ctx.beginPath();
    ctx.arc(cx, cy - 145, 42, Math.PI, Math.PI * 2);
    ctx.fillStyle = '#c8a24a'; // bronde/golden brown
    ctx.fill();

    // HAIR STRANDS DETAIL
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 15, cy - 175);
        ctx.quadraticCurveTo(cx + i * 25, cy - 120, cx + i * 20, cy - 80);
        ctx.strokeStyle = '#b88a3c';
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    // EYES
    ctx.beginPath();
    ctx.arc(cx - 13, cy - 145, 4, 0, Math.PI * 2);
    ctx.arc(cx + 13, cy - 145, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#3a1a00';
    ctx.fill();

    // SMILE
    ctx.beginPath();
    ctx.arc(cx, cy - 130, 10, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#cc5500';
    ctx.lineWidth = 2;
    ctx.stroke();

    // SIMPLE CROWN
    ctx.beginPath();
    ctx.moveTo(cx - 25, cy - 175);
    ctx.lineTo(cx - 15, cy - 195);
    ctx.lineTo(cx, cy - 180);
    ctx.lineTo(cx + 15, cy - 195);
    ctx.lineTo(cx + 25, cy - 175);
    ctx.closePath();
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#cc9900';
    ctx.stroke();
}
}


// COLLISION
function checkCollision(soap) {
    const w = soap.size * 1.6;
    const h = soap.size;
    const margin = 15;

    return (
        earthio.x + margin < soap.x + w &&
        earthio.x + earthio.width - margin > soap.x &&
        earthio.y + margin < soap.y + h &&
        earthio.y + earthio.height - margin > soap.y
    );
}


// RESET
function resetGame() {
    round = 1;
    dodged = 0;
    soaps = [];
    soapTimer = -60;
    failTimer = 0;

    gameState = 'playing';

    earthio.x = canvas.width / 2;
    earthio.y = GROUND_Y - earthio.height;
    earthio.velocityY = 0;
    earthio.isJumping = false;
}


// NEXT ROUND
function nextRound() {
    round++;
    dodged = 0;
    soaps = [];
    soapTimer = -60;

    earthio.x = canvas.width / 2;
    earthio.y = GROUND_Y - earthio.height;
    earthio.velocityY = 0;
    earthio.isJumping = false;
}


// INPUT
let lastKey = null;
const keys = { left: false, right: false };

document.addEventListener('keydown', (e) => {
    if (gameState !== 'playing') return;

    if (e.key === 'ArrowLeft' || e.key === 'a') {
        keys.left = true;
        lastKey = 'left';
        facingLeft = true;
    }

    if (e.key === 'ArrowRight' || e.key === 'd') {
        keys.right = true;
        lastKey = 'right';
        facingLeft = false;
    }

    if ((e.key === ' ' || e.key === 'w' || e.key === 'ArrowUp') && !earthio.isJumping) {
        earthio.velocityY = -earthio.jumpPower;
        earthio.isJumping = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
});


// UPDATE
function update() {

    // ✅ AUTO RESTART AFTER FAIL
    if (gameState === 'fail') {
        failTimer++;

        if (failTimer > 120) { // ~2 seconds
            resetGame();
        }
        return;
    }

    bubbleTime += 0.05;

    // MOVEMENT
    earthio.dx = 0;

    if (lastKey === 'left' && keys.left)
        earthio.dx = -earthio.speed;

    if (lastKey === 'right' && keys.right)
        earthio.dx = earthio.speed;

    earthio.x += earthio.dx;

    // JUMP
    if (earthio.isJumping) {
        earthio.velocityY += earthio.gravity;
        earthio.y += earthio.velocityY;

        if (earthio.y >= GROUND_Y - earthio.height) {
            earthio.y = GROUND_Y - earthio.height;
            earthio.velocityY = 0;
            earthio.isJumping = false;
        }
    }

    // WALLS
    if (earthio.x < 0) earthio.x = 0;
    if (earthio.x + earthio.width > canvas.width)
        earthio.x = canvas.width - earthio.width;

    // ANIMATION
    frameTimer++;
    if (frameTimer > 10) {
        currentFrame++;
        frameTimer = 0;
    }

    // SPAWN SOAPS
    soapTimer++;
    if (soapTimer >= getSoapInterval()) {
        spawnSoap();
        soapTimer = 0;
    }

    // UPDATE SOAPS
    for (let i = soaps.length - 1; i >= 0; i--) {

        soaps[i].x -= soaps[i].speed;

        if (!soaps[i].dodged && checkCollision(soaps[i])) {
            gameState = 'fail';
            failTimer = 0;
            return;
        }

        if (!soaps[i].dodged && soaps[i].x + soaps[i].size * 1.6 < earthio.x) {
            soaps[i].dodged = true;
            dodged++;
        }

        if (soaps[i].x < -100) soaps.splice(i, 1);
    }

    // ROUND CHECK
    if (dodged >= DODGES_PER_ROUND[round]) {
        if (round >= 5) gameState = 'win';
        else nextRound();
    }
}


// DRAW
function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // SKY + GROUND
    ctx.fillStyle = 'skyblue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#555';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

    if (gameState === 'playing') {

        soaps.forEach(drawSoap);

        const currentImage =
            (keys.left || keys.right)
                ? walkFrames[currentFrame % walkFrames.length]
                : horse;

        ctx.drawImage(
            currentImage,
            earthio.x,
            earthio.y,
            earthio.width,
            earthio.height
        );

        ctx.fillStyle = 'white';
        ctx.font = '20px Georgia';
        ctx.fillText(`Round ${round}`, 20, 40);
        ctx.fillText(`Dodged: ${dodged}`, 20, 70);
    }

    if (gameState === 'fail') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '40px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText('You got soaped by the UCU Queen!', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
    }

    if (gameState === 'win') {
        drawGirl(canvas.width / 2, canvas.height / 2);
    }
}


// LOOP
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();