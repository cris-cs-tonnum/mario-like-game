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
    y: GROUND_Y - 93,
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

function getSoapInterval() { return Math.max(80, 120 - round * 8); }
function getSoapSpeed()    { return 2 + round * 0.5; }

function spawnSoap() {
    const size = 35 + Math.random() * 20;
    soaps.push({ x: canvas.width + size * 1.6, y: GROUND_Y - size, size, speed: getSoapSpeed(), dodged: false });
}

function drawSoap(soap) {
    const { x, y, size } = soap;
    const w = size * 1.6, h = size, r = 10;
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
    // dress
    ctx.beginPath();
    ctx.moveTo(cx, cy - 60);
    ctx.bezierCurveTo(cx - 80, cy - 20, cx - 100, cy + 80, cx - 60, cy + 150);
    ctx.lineTo(cx + 60, cy + 150);
    ctx.bezierCurveTo(cx + 100, cy + 80, cx + 80, cy - 20, cx, cy - 60);
    ctx.fillStyle = '#ff69b4'; ctx.fill();
    ctx.strokeStyle = '#cc3377'; ctx.lineWidth = 2; ctx.stroke();
    // head
    ctx.beginPath();
    ctx.arc(cx, cy - 140, 38, 0, Math.PI * 2);
    ctx.fillStyle = '#fddbb4'; ctx.fill();
    // hair
    ctx.beginPath();
    ctx.arc(cx, cy - 145, 42, Math.PI, Math.PI * 2);
    ctx.fillStyle = '#8B6914'; ctx.fill();
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 15, cy - 175);
        ctx.quadraticCurveTo(cx + i * 25, cy - 120, cx + i * 20, cy - 80);
        ctx.strokeStyle = '#6B4F12'; ctx.lineWidth = 5; ctx.stroke();
    }
    // eyes
    ctx.beginPath();
    ctx.arc(cx - 13, cy - 145, 4, 0, Math.PI * 2);
    ctx.arc(cx + 13, cy - 145, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#3a1a00'; ctx.fill();
    // smile
    ctx.beginPath();
    ctx.arc(cx, cy - 130, 10, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#cc5500'; ctx.lineWidth = 2; ctx.stroke();
    // crown
    ctx.beginPath();
    ctx.moveTo(cx - 25, cy - 175); ctx.lineTo(cx - 15, cy - 195);
    ctx.lineTo(cx, cy - 180);     ctx.lineTo(cx + 15, cy - 195);
    ctx.lineTo(cx + 25, cy - 175);
    ctx.closePath();
    ctx.fillStyle = '#ffd700'; ctx.fill();
    ctx.strokeStyle = '#cc9900'; ctx.stroke();
}

function checkCollision(soap) {
    const w = soap.size * 1.6, h = soap.size, m = 15;
    return (
        earthio.x + m < soap.x + w &&
        earthio.x + earthio.width - m > soap.x &&
        earthio.y + m < soap.y + h &&
        earthio.y + earthio.height - m > soap.y
    );
}

function resetGame() {
    round = 1; dodged = 0; soaps = []; soapTimer = -60;
    gameState = 'playing';
    earthio.x = canvas.width / 2;
    earthio.y = GROUND_Y - 80;
    earthio.velocityY = 0; earthio.isJumping = false;
}

function nextRound() {
    round++; dodged = 0; soaps = []; soapTimer = -60;
    earthio.x = canvas.width / 2;
    earthio.y = GROUND_Y - 80;
    earthio.velocityY = 0; earthio.isJumping = false;
}

// REPLAY BUTTON
const replayBtn = document.createElement('button');
replayBtn.textContent = 'Play Again';
replayBtn.style.cssText = `
    position:absolute; display:none; padding:16px 40px;
    font-size:24px; font-family:'Georgia',serif;
    background:#ff69b4; color:white; border:none;
    border-radius:50px; cursor:pointer;
    box-shadow:0 4px 20px rgba(255,105,180,0.5);
    transition:transform 0.1s;
`;
replayBtn.onmouseover = () => replayBtn.style.transform = 'scale(1.05)';
replayBtn.onmouseleave = () => replayBtn.style.transform = 'scale(1)';
replayBtn.onclick = () => { replayBtn.style.display = 'none'; resetGame(); };
document.body.appendChild(replayBtn);

function showReplay() {
    replayBtn.style.display = 'block';
    replayBtn.style.left = (canvas.width / 2 - 100) + 'px';
    replayBtn.style.top  = (canvas.height / 2 + 60) + 'px';
}

// INPUT
let lastKey = null;
const keys = { left: false, right: false };

document.addEventListener('keydown', (e) => {
    if (gameState !== 'playing') return;
    if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') { keys.left  = true;  lastKey = 'left';  }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keys.right = true;  lastKey = 'right'; }
    if ((e.key === ' ' || e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') && !earthio.isJumping) {
        earthio.velocityY = -earthio.jumpPower;
        earthio.isJumping = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') { keys.left  = false; if (keys.right) lastKey = 'right'; }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keys.right = false; if (keys.left)  lastKey = 'left';  }
});

// UPDATE
function update() {
    if (gameState !== 'playing') return;

    earthio.dx = 0;
    if (lastKey === 'left'  && keys.left)  earthio.dx = -earthio.speed;
    if (lastKey === 'right' && keys.right) earthio.dx =  earthio.speed;
    earthio.x += earthio.dx;

    if (earthio.isJumping) {
        earthio.velocityY += earthio.gravity;
        earthio.y += earthio.velocityY;
       if (earthio.y >= GROUND_Y - 93) {
           earthio.y = GROUND_Y - 93;
            earthio.velocityY = 0;
            earthio.isJumping = false;
        }
    }

    if (earthio.x < 0) earthio.x = 0;
    if (earthio.x + earthio.width > canvas.width) earthio.x = canvas.width - earthio.width;

    frameTimer++;
    if (frameTimer > 10) { currentFrame++; frameTimer = 0; }

    soapTimer++;
    if (soapTimer >= getSoapInterval()) { spawnSoap(); soapTimer = 0; }

    for (let i = soaps.length - 1; i >= 0; i--) {
        soaps[i].x -= soaps[i].speed;

        if (!soaps[i].dodged && checkCollision(soaps[i])) {
            gameState = 'fail';
            keys.left = keys.right = false;
            showReplay();
            return;
        }

        if (!soaps[i].dodged && soaps[i].x + soaps[i].size * 1.6 < earthio.x) {
            soaps[i].dodged = true;
            dodged++;
        }

        if (soaps[i].x + soaps[i].size * 1.6 < 0) soaps.splice(i, 1);
    }

    if (gameState === 'playing' && dodged >= DODGES_PER_ROUND[round]) {
        if (round >= 5) { gameState = 'win'; showReplay(); }
        else nextRound();
    }
}

// DRAW
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'skyblue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#555';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

    if (gameState === 'playing') {
        soaps.forEach(drawSoap);

        let img = horse;
        if (keys.left || keys.right) {
            const f = walkFrames[currentFrame % walkFrames.length];
            if (f) img = f;
        }
        if (img) ctx.drawImage(img, earthio.x, earthio.y, earthio.width, earthio.height);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Georgia';
        ctx.fillText(`Round ${round}`, 20, 40);
        ctx.fillText(`Dodged: ${dodged} / ${DODGES_PER_ROUND[round]}`, 20, 72);
    }

    if (gameState === 'fail') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 56px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText('You got soaped by The UCU Queen!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '28px Georgia';
        ctx.fillText(`Round ${round} — dodged ${dodged} / ${DODGES_PER_ROUND[round]}`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.textAlign = 'left';
    }

    if (gameState === 'win') {
        ctx.fillStyle = '#ffe4f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGirl(canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = '#cc3377';
        ctx.font = 'bold 60px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText('You Win!', canvas.width / 2, canvas.height * 0.15);
        ctx.font = '26px Georgia';
        ctx.fillText('Mother May is captured!', canvas.width / 2, canvas.height * 0.15 + 50);
        ctx.textAlign = 'left';
    }
}

// LOOP
function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
gameLoop();