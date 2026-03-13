// ═══════════════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════════════
const selectorEl = document.getElementById('game-selector');
const arenas = {
  memory: document.getElementById('game-memory'),
  maze:   document.getElementById('game-maze'),
};
const winOverlay = document.getElementById('win-overlay');
const winTitle   = document.getElementById('win-title');
const winMsg     = document.getElementById('win-msg');

let currentGame = null;

function showSelector() {
  Object.values(arenas).forEach(a => a.hidden = true);
  selectorEl.hidden = false;
  winOverlay.classList.remove('visible');
  currentGame = null;
}

function showGame(name) {
  selectorEl.hidden = true;
  Object.values(arenas).forEach(a => a.hidden = true);
  arenas[name].hidden = false;
  currentGame = name;
  if (name === 'memory') initMemoryGame();
  if (name === 'maze')   initMazeGame();
  arenas[name].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Card clicks
document.querySelectorAll('.g-card').forEach(card => {
  card.addEventListener('click', () => showGame(card.dataset.game));
});

// Back buttons
document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', showSelector);
});

// Win overlay buttons
document.getElementById('win-replay').addEventListener('click', () => {
  winOverlay.classList.remove('visible');
  if (currentGame) showGame(currentGame);
});
document.getElementById('win-back').addEventListener('click', showSelector);

function showWin(title, msg) {
  winTitle.textContent = title;
  winMsg.textContent = msg;
  winOverlay.classList.add('visible');
}

// ═══════════════════════════════════════════════════════════════
//  GAME 2: MEMORY MATCH
// ═══════════════════════════════════════════════════════════════
const MEM_ICONS = ['💍', '❤️', '🌹', '🎂', '🔔', '🎁', '🕊️', '🥂'];
let memMoves = 0;
let memPairs = 0;
let memFlipped = [];
let memLocked = false;

function initMemoryGame() {
  const grid = document.getElementById('mem-grid');
  grid.innerHTML = '';
  memMoves = 0;
  memPairs = 0;
  memFlipped = [];
  memLocked = false;
  document.getElementById('mem-moves').textContent = '0';
  document.getElementById('mem-pairs').textContent = '0';

  // Create pairs and shuffle
  const icons = [...MEM_ICONS, ...MEM_ICONS];
  shuffle(icons);

  icons.forEach((icon, i) => {
    const card = document.createElement('div');
    card.className = 'mem-card';
    card.dataset.icon = icon;
    card.dataset.index = i;
    card.innerHTML = `
      <div class="mem-card__inner">
        <div class="mem-card__front"></div>
        <div class="mem-card__back">${icon}</div>
      </div>
    `;
    card.addEventListener('click', () => flipCard(card));
    grid.appendChild(card);
  });
}

function flipCard(card) {
  if (memLocked) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  memFlipped.push(card);

  if (memFlipped.length === 2) {
    memMoves++;
    document.getElementById('mem-moves').textContent = memMoves;
    memLocked = true;

    const [a, b] = memFlipped;
    if (a.dataset.icon === b.dataset.icon) {
      a.classList.add('matched');
      b.classList.add('matched');
      memPairs++;
      document.getElementById('mem-pairs').textContent = memPairs;
      memFlipped = [];
      memLocked = false;
      if (memPairs === 8) {
        setTimeout(() => showWin('Perfect Match!', `You matched all pairs in ${memMoves} moves!`), 500);
      }
    } else {
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        memFlipped = [];
        memLocked = false;
      }, 800);
    }
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ═══════════════════════════════════════════════════════════════
//  GAME 3: LOVE MAZE
// ═══════════════════════════════════════════════════════════════
const MAZE_COLS = 15;
const MAZE_ROWS = 11;
let mazeGrid = [];
let playerPos = { r: 0, c: 0 };
let endPos = { r: MAZE_ROWS - 1, c: MAZE_COLS - 1 };

let mazeMoves = 0;
let mazeCanvas, mazeCtx, cellSize;

function initMazeGame() {
  mazeMoves = 0;
  document.getElementById('maze-moves').textContent = '0';
  mazeCanvas = document.getElementById('maze-canvas');
  mazeCtx = mazeCanvas.getContext('2d');

  // Responsive cell size
  const maxW = Math.min(600, window.innerWidth - 40);
  cellSize = Math.floor(maxW / MAZE_COLS);
  mazeCanvas.width = MAZE_COLS * cellSize;
  mazeCanvas.height = MAZE_ROWS * cellSize;

  mazeGrid = generateMaze(MAZE_ROWS, MAZE_COLS);
  playerPos = { r: 0, c: 0 };
  endPos = { r: MAZE_ROWS - 1, c: MAZE_COLS - 1 };
  drawMaze();
}

// Maze generation using recursive backtracker
function generateMaze(rows, cols) {
  // Each cell: { top, right, bottom, left, visited }
  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] = { top: true, right: true, bottom: true, left: true, visited: false };
    }
  }

  const stack = [];
  const start = grid[0][0];
  start.visited = true;
  stack.push({ r: 0, c: 0 });

  while (stack.length > 0) {
    const curr = stack[stack.length - 1];
    const neighbors = [];
    const dirs = [
      { dr: -1, dc: 0, wall: 'top', opposite: 'bottom' },
      { dr: 1, dc: 0, wall: 'bottom', opposite: 'top' },
      { dr: 0, dc: -1, wall: 'left', opposite: 'right' },
      { dr: 0, dc: 1, wall: 'right', opposite: 'left' },
    ];

    for (const d of dirs) {
      const nr = curr.r + d.dr;
      const nc = curr.c + d.dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc].visited) {
        neighbors.push({ r: nr, c: nc, wall: d.wall, opposite: d.opposite });
      }
    }

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      grid[curr.r][curr.c][next.wall] = false;
      grid[next.r][next.c][next.opposite] = false;
      grid[next.r][next.c].visited = true;
      stack.push({ r: next.r, c: next.c });
    } else {
      stack.pop();
    }
  }

  return grid;
}

function drawMaze() {
  const ctx = mazeCtx;
  const cs = cellSize;
  ctx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);

  // Background
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, mazeCanvas.width, mazeCanvas.height);

  // Walls
  ctx.strokeStyle = '#887180';
  ctx.lineWidth = 2;

  for (let r = 0; r < MAZE_ROWS; r++) {
    for (let c = 0; c < MAZE_COLS; c++) {
      const x = c * cs;
      const y = r * cs;
      const cell = mazeGrid[r][c];

      if (cell.top)    { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cs, y); ctx.stroke(); }
      if (cell.right)  { ctx.beginPath(); ctx.moveTo(x + cs, y); ctx.lineTo(x + cs, y + cs); ctx.stroke(); }
      if (cell.bottom) { ctx.beginPath(); ctx.moveTo(x, y + cs); ctx.lineTo(x + cs, y + cs); ctx.stroke(); }
      if (cell.left)   { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + cs); ctx.stroke(); }
    }
  }

  // End position — Ring
  ctx.font = `${cs * 0.6}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💍', endPos.c * cs + cs / 2, endPos.r * cs + cs / 2);

  // Player — Heart
  ctx.fillText('❤️', playerPos.c * cs + cs / 2, playerPos.r * cs + cs / 2);
}
function movePlayer(dr, dc) {
  const nr = playerPos.r + dr;
  const nc = playerPos.c + dc;
  if (nr < 0 || nr >= MAZE_ROWS || nc < 0 || nc >= MAZE_COLS) return;

  // Check wall
  const cell = mazeGrid[playerPos.r][playerPos.c];
  if (dr === -1 && cell.top) return;
  if (dr === 1 && cell.bottom) return;
  if (dc === -1 && cell.left) return;
  if (dc === 1 && cell.right) return;

  playerPos.r = nr;
  playerPos.c = nc;
  mazeMoves++;
  document.getElementById('maze-moves').textContent = mazeMoves;
  drawMaze();

  if (nr === endPos.r && nc === endPos.c) {
    setTimeout(() => showWin('Maze Complete!', `You reached the ring in ${mazeMoves} moves!`), 300);
  }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (currentGame !== 'maze') return;
  switch (e.key) {
    case 'ArrowUp':    e.preventDefault(); movePlayer(-1, 0); break;
    case 'ArrowDown':  e.preventDefault(); movePlayer(1, 0); break;
    case 'ArrowLeft':  e.preventDefault(); movePlayer(0, -1); break;
    case 'ArrowRight': e.preventDefault(); movePlayer(0, 1); break;
  }
});

// On-screen button controls
document.querySelectorAll('.maze-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const dir = btn.dataset.dir;
    if (dir === 'up')    movePlayer(-1, 0);
    if (dir === 'down')  movePlayer(1, 0);
    if (dir === 'left')  movePlayer(0, -1);
    if (dir === 'right') movePlayer(0, 1);
  });
});

// Touch/swipe controls for maze
(function () {
  let startX, startY;
  const canvas = document.getElementById('maze-canvas');

  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
  }, { passive: true });

  canvas.addEventListener('touchend', (e) => {
    if (currentGame !== 'maze') return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const minSwipe = 20;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minSwipe) movePlayer(0, dx > 0 ? 1 : -1);
    } else {
      if (Math.abs(dy) > minSwipe) movePlayer(dy > 0 ? 1 : -1, 0);
    }
  }, { passive: true });
})();
