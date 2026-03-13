// Target: 3rd May 2026, 10:00 AM IST (UTC+5:30)
const TARGET = new Date('2026-05-03T10:00:00+05:30');

const daysEl  = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minsEl  = document.getElementById('mins');
const timerEl = document.getElementById('countdown');
const doneEl  = document.getElementById('countdown-done');

function pad(n) {
  return String(n).padStart(2, '0');
}

function tick() {
  const now  = new Date();
  const diff = TARGET - now;

  if (diff <= 0) {
    timerEl.hidden = true;
    doneEl.hidden  = false;
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days  = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins  = Math.floor((totalSeconds % 3600) / 60);

  daysEl.textContent  = days;
  hoursEl.textContent = pad(hours);
  minsEl.textContent  = pad(mins);
}

tick();
setInterval(tick, 1000);

// ─── Petal Shower ────────────────────────────────────────────
const PETAL_COLORS = ['#a8c5a0', '#8fa98c', '#c8dfc4', '#6b9e6b', '#b8d4b4', '#AFBFCB', '#897180'];

function spawnPetal(delay = 0) {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const petal = document.createElement('div');
  petal.classList.add('petal');

  const isMobile = window.innerWidth <= 768;
  const size  = isMobile ? Math.random() * 5 + 4 : Math.random() * 12 + 8;
  const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
  const left  = Math.random() * 100;
  const dur   = (Math.random() * 4 + 5).toFixed(2);
  const drift = ((Math.random() - 0.5) * 120).toFixed(0) + 'px';
  const spin  = (Math.random() * 360).toFixed(0) + 'deg';

  petal.style.cssText = `
    width: ${size}px;
    height: ${(size * 1.4).toFixed(1)}px;
    background: ${color};
    left: ${left}%;
    top: 0;
    animation-duration: ${dur}s;
    animation-delay: ${delay}s;
    --drift: ${drift};
    --spin: ${spin};
  `;

  hero.appendChild(petal);
  petal.addEventListener('animationend', () => petal.remove(), { once: true });
}

// Burst of petals immediately on load, staggered across the screen
for (let i = 0; i < 20; i++) {
  spawnPetal((i * 0.15).toFixed(2));
}

// Then continuous shower
setInterval(() => spawnPetal(0), 300);
