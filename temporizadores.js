// ================== CONFIGURACIÓN ==================
// Aquí defines los 5 cronómetros: su nombre y su duración por defecto (segundos).
// Si algún día quieres un 6º cronómetro, solo tienes que añadir una línea aquí.

const timersConfig = [
  { label: 'Partida normal', defaultDuration: 15 * 60 },
  { label: 'Descanso', defaultDuration: 20 * 60 },
  { label: 'Crono 3', defaultDuration: 0 },
  { label: 'Crono 4', defaultDuration: 0 },
  { label: 'Crono 5', defaultDuration: 0 },
];

// ================== ESTADO ==================

let timers = timersConfig.map((cfg) => ({
  label: cfg.label,
  duration: cfg.defaultDuration,
  elapsedMs: 0,
  running: false,
  overtimeAlerted: false,
}));

let lastTick = Date.now();

// ================== CONSTRUIR LA INTERFAZ ==================

const container = document.getElementById('timersList');

function buildUI() {
  container.innerHTML = timers.map((t, i) => `
    <div class="mini-timer" data-index="${i}">
      <div class="mini-timer-top">
        <span class="mini-timer-label">${t.label}</span>
        <span class="mini-timer-display" id="timerDisplay-${i}">${formatTime(t.duration * 1000)}</span>
      </div>
      <div class="mini-timer-controls">
        <button class="btn-mini btn-mini-adjust" data-index="${i}" data-adjust="-60">-1m</button>
        <button class="btn-mini btn-mini-play" id="timerPlay-${i}" data-index="${i}">&#9654;</button>
        <button class="btn-mini btn-mini-adjust" data-index="${i}" data-adjust="60">+1m</button>
      </div>
      <div class="mini-timer-controls">
        <button class="btn-mini btn-mini-reset" data-index="${i}">Reiniciar</button>
      </div>
    </div>
  `).join('');
}

// ================== RENDER ==================

function renderTimer(i) {
  const t = timers[i];
  const remaining = t.duration * 1000 - t.elapsedMs;
  const displayEl = document.getElementById(`timerDisplay-${i}`);
  const playBtn = document.getElementById(`timerPlay-${i}`);

  if (remaining > 0) {
    displayEl.textContent = formatTime(remaining);
    displayEl.classList.remove('overtime');
  } else {
    displayEl.textContent = '+' + formatTime(remaining);
    displayEl.classList.add('overtime');
    if (!t.overtimeAlerted) {
      t.overtimeAlerted = true;
      beep();
    }
  }

  playBtn.innerHTML = t.running ? '&#10074;&#10074;' : '&#9654;';
  playBtn.classList.toggle('running', t.running);
}

// ================== BUCLE ==================
// Un único bucle actualiza los 5 a la vez; cada uno solo avanza si está "running".
// Así pueden ir varios cronómetros a la vez sin pisarse entre ellos.

function tick() {
  const now = Date.now();
  const delta = now - lastTick;
  lastTick = now;

  timers.forEach((t, i) => {
    if (t.running) t.elapsedMs += delta;
    renderTimer(i);
  });

  requestAnimationFrame(tick);
}

// ================== ACCIONES ==================

function adjust(i, deltaSeconds) {
  timers[i].duration = Math.max(0, timers[i].duration + deltaSeconds);
  renderTimer(i);
}

function togglePlay(i) {
  if (!timers[i].running) primeAudio();
  timers[i].running = !timers[i].running;
  renderTimer(i);
}

function resetTimer(i) {
  timers[i].elapsedMs = 0;
  timers[i].running = false;
  timers[i].overtimeAlerted = false;
  renderTimer(i);
}

function resetAll() {
  timers.forEach((t, i) => {
    resetTimer(i);
  });
}

// ================== EVENTOS (delegados en el contenedor) ==================

container.addEventListener('click', (e) => {
  const adjustBtn = e.target.closest('.btn-mini-adjust');
  if (adjustBtn) {
    adjust(parseInt(adjustBtn.dataset.index, 10), parseInt(adjustBtn.dataset.adjust, 10));
    return;
  }
  const playBtn = e.target.closest('.btn-mini-play');
  if (playBtn) {
    togglePlay(parseInt(playBtn.dataset.index, 10));
    return;
  }
  const resetBtn = e.target.closest('.btn-mini-reset');
  if (resetBtn) {
    resetTimer(parseInt(resetBtn.dataset.index, 10));
  }
});

document.getElementById('resetAllBtn').addEventListener('click', resetAll);

// ================== INICIO ==================

buildUI();
requestAnimationFrame(tick);