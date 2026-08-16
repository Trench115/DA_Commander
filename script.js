// ================== ESTADO ==================

// Crono principal (tiempo de la ronda)
let mainDuration = 300;   // segundos configurados (por defecto 5 min)
let mainElapsedMs = 0;    // ms transcurridos desde que se le dio a Iniciar
let mainRunning = false;  // ¿está contando ahora mismo?
let started = false;      // ¿se ha pulsado Iniciar alguna vez en esta ronda?
let overtimeAlerted = false; // para pitar solo una vez al llegar a 0

// Posesión de los equipos
let timeRed = 0;
let timeBlue = 0;
let activeTeam = null; // 'red' | 'blue' | null (neutral, nadie tiene el objetivo)

let lastTick = null;
let loopId = null;
let audioCtx = null;

// ================== ELEMENTOS ==================

const mainTimerDisplay = document.getElementById('mainTimerDisplay');
const setupControls = document.getElementById('setupControls');
const mainPlayPause = document.getElementById('mainPlayPause');

const teamRedEl = document.getElementById('teamRed');
const teamBlueEl = document.getElementById('teamBlue');
const timeRedEl = document.getElementById('timeRed');
const timeBlueEl = document.getElementById('timeBlue');
const percentRedEl = document.getElementById('percentRed');
const percentBlueEl = document.getElementById('percentBlue');

const resetBtn = document.getElementById('resetBtn');
const finishBtn = document.getElementById('finishBtn');
const modal = document.getElementById('modal');
const modalWinner = document.getElementById('modalWinner');
const modalDetail = document.getElementById('modalDetail');
const closeModal = document.getElementById('closeModal');

// ================== UTILIDADES ==================

function formatTime(ms) {
  const totalSec = Math.floor(Math.abs(ms) / 1000);
  const min = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const sec = (totalSec % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

// Pitido de aviso (funciona en iPhone porque el AudioContext se "prepara"
// en el primer toque a Iniciar, que es un gesto real del usuario)
function primeAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function beep() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
}

// ================== RENDER ==================

function renderMain() {
  const remainingMs = mainDuration * 1000 - mainElapsedMs;

  if (remainingMs > 0) {
    mainTimerDisplay.textContent = formatTime(remainingMs);
    mainTimerDisplay.classList.remove('overtime');
  } else {
    mainTimerDisplay.textContent = '+' + formatTime(remainingMs);
    mainTimerDisplay.classList.add('overtime');
    if (!overtimeAlerted) {
      overtimeAlerted = true;
      beep();
    }
  }

  setupControls.style.display = started ? 'none' : 'flex';

  mainPlayPause.textContent = mainRunning ? 'Pausar' : (started ? 'Reanudar' : 'Iniciar');
  mainPlayPause.classList.toggle('running', mainRunning);
}

function renderTeams() {
  timeRedEl.textContent = formatTime(timeRed);
  timeBlueEl.textContent = formatTime(timeBlue);

  const total = timeRed + timeBlue;
  const pRed = total > 0 ? Math.round((timeRed / total) * 100) : 50;
  const pBlue = total > 0 ? 100 - pRed : 50;
  percentRedEl.textContent = `${pRed}%`;
  percentBlueEl.textContent = `${pBlue}%`;

  teamRedEl.classList.toggle('active', activeTeam === 'red');
  teamBlueEl.classList.toggle('active', activeTeam === 'blue');

  // Los equipos solo se pueden tocar mientras el crono principal está contando
  teamRedEl.classList.toggle('disabled', !mainRunning);
  teamBlueEl.classList.toggle('disabled', !mainRunning);
}

// ================== BUCLE ==================
// El bucle solo corre mientras el crono principal está en marcha.
// Así nos aseguramos de que la posesión de los equipos nunca avanza
// si la ronda está en pausa.

function tick() {
  const now = Date.now();
  const delta = now - lastTick;
  lastTick = now;

  mainElapsedMs += delta;
  if (activeTeam === 'red') timeRed += delta;
  if (activeTeam === 'blue') timeBlue += delta;

  renderMain();
  renderTeams();
  loopId = requestAnimationFrame(tick);
}

function startLoop() {
  if (loopId) return;
  lastTick = Date.now();
  loopId = requestAnimationFrame(tick);
}

function stopLoop() {
  if (loopId) cancelAnimationFrame(loopId);
  loopId = null;
}

// ================== CRONO PRINCIPAL ==================

function adjustDuration(deltaSeconds) {
  if (started) return; // ya no se puede tocar una vez iniciada la ronda
  mainDuration = Math.max(0, mainDuration + deltaSeconds);
  renderMain();
}

function toggleMain() {
  if (!started) {
    started = true;
    primeAudio();
  }
  mainRunning = !mainRunning;
  if (mainRunning) {
    startLoop();
  } else {
    stopLoop();
  }
  renderMain();
  renderTeams();
}

// ================== EQUIPOS ==================

function toggleTeam(team) {
  if (!mainRunning) return; // por seguridad, aunque el botón ya está deshabilitado
  activeTeam = (activeTeam === team) ? null : team;
  renderTeams();
}

// ================== RESET / FINALIZAR ==================

function resetAll() {
  mainElapsedMs = 0;
  mainRunning = false;
  started = false;
  overtimeAlerted = false;
  timeRed = 0;
  timeBlue = 0;
  activeTeam = null;
  stopLoop();
  renderMain();
  renderTeams();
}

function finishRound() {
  mainRunning = false;
  activeTeam = null;
  stopLoop();
  renderTeams();

  const total = timeRed + timeBlue;
  const pRed = total > 0 ? Math.round((timeRed / total) * 100) : 50;
  const pBlue = total > 0 ? 100 - pRed : 50;

  let winnerText;
  if (pRed === pBlue) {
    winnerText = 'EMPATE';
  } else if (pRed > pBlue) {
    winnerText = 'EQUIPO ROJO GANA';
  } else {
    winnerText = 'EQUIPO AZUL GANA';
  }

  modalWinner.textContent = winnerText;
  modalDetail.textContent = `${pRed}% - ${pBlue}% de posesión`;
  modal.classList.add('show');
}

// ================== EVENTOS ==================

document.querySelectorAll('.btn-adjust').forEach((btn) => {
  btn.addEventListener('click', () => adjustDuration(parseInt(btn.dataset.adjust, 10)));
});

mainPlayPause.addEventListener('click', toggleMain);
teamRedEl.addEventListener('click', () => toggleTeam('red'));
teamBlueEl.addEventListener('click', () => toggleTeam('blue'));
resetBtn.addEventListener('click', resetAll);
finishBtn.addEventListener('click', finishRound);
closeModal.addEventListener('click', () => modal.classList.remove('show'));

// Pintado inicial
renderMain();
renderTeams();

// Registrar Service Worker (modo offline)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}