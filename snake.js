const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const statusEl = document.getElementById('status');

const tileSize = 20;
const tiles = canvas.width / tileSize;
const speedMs = 120;

let snake;
let direction;
let nextDirection;
let food;
let score;
let bestScore = Number(localStorage.getItem('snake-best') || 0);
let gameOver;
let paused;

bestEl.textContent = String(bestScore);

function randomPoint() {
  return {
    x: Math.floor(Math.random() * tiles),
    y: Math.floor(Math.random() * tiles),
  };
}

function placeFood() {
  let point = randomPoint();
  while (snake.some((segment) => segment.x === point.x && segment.y === point.y)) {
    point = randomPoint();
  }
  food = point;
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { ...direction };
  score = 0;
  gameOver = false;
  paused = false;
  statusEl.textContent = '';
  scoreEl.textContent = '0';
  placeFood();
}

function draw() {
  ctx.fillStyle = '#1a2433';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ef476f';
  ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);

  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#06d6a0' : '#34c89a';
    ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
  });
}

function tick() {
  if (paused || gameOver) {
    draw();
    return;
  }

  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitWall = head.x < 0 || head.x >= tiles || head.y < 0 || head.y >= tiles;
  const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    gameOver = true;
    statusEl.textContent = 'Koniec gry! Naciśnij Enter, aby zagrać ponownie.';
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreEl.textContent = String(score);
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('snake-best', String(bestScore));
      bestEl.textContent = String(bestScore);
    }
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function setDirection(x, y) {
  if (direction.x === -x && direction.y === -y) {
    return;
  }
  nextDirection = { x, y };
}

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if ((key === 'arrowup' || key === 'w') && direction.y !== 1) setDirection(0, -1);
  if ((key === 'arrowdown' || key === 's') && direction.y !== -1) setDirection(0, 1);
  if ((key === 'arrowleft' || key === 'a') && direction.x !== 1) setDirection(-1, 0);
  if ((key === 'arrowright' || key === 'd') && direction.x !== -1) setDirection(1, 0);

  if (key === ' ') {
    if (!gameOver) {
      paused = !paused;
      statusEl.textContent = paused ? 'Pauza' : '';
    }
  }

  if (key === 'enter') {
    resetGame();
    draw();
  }
});

resetGame();
draw();
setInterval(tick, speedMs);
