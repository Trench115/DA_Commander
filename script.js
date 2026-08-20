// ================== ESTADO ==================
// (formatTime, primeAudio y beep vienen de common.js)

let mainDuration = 25 * 60;
let mainElapsedMs = 0;
let mainRunning = false;
let started = false;
let overtimeAlerted = false;

let timeRed = 0;
let timeBlue = 0;
let activeTeam = null; // 'red' | 'blue' | null

let lastTick = null;
let loopId = null;

// ================== ELEMENTOS ==================

const mainTimerDisplay = document.getElementById('mainTimerDisplay');
const setupControls = document.getElementById('setupControls');
const mainPlayPause = document.getElementById('mainPlayPause');

const teamRedEl = document.getElementById('teamRed');
const teamBlueEl = document.getElementById('teamBlue');
const neutralControlEl = document.getElementById('neutralControl');
const timeRedEl = document.getElementById('timeRed');
const timeBlueEl = document.getElementById('timeBlue');
const scoreRedEl = document.getElementById('scoreRed');
const scoreBlueEl = document.getElementById('scoreBlue');

const resetBtn = document.getElementById('resetBtn');
const finishBtn = document.getElementById('finishBtn');
const modal = document.getElementById('modal');
const modalWinner = document.getElementById('modalWinner');
const modalDetail = document.getElementById('modalDetail');
const closeModal = document.getElementById('closeModal');

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

  scoreRedEl.textContent = String(Math.floor(timeRed / 5000));
  scoreBlueEl.textContent = String(Math.floor(timeBlue / 5000));

  teamRedEl.classList.toggle('active', activeTeam === 'red');
  teamBlueEl.classList.toggle('active', activeTeam === 'blue');
  teamRedEl.classList.toggle('disabled', !mainRunning);
  teamBlueEl.classList.toggle('disabled', !mainRunning);
}

// ================== BUCLE ==================

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
  if (started) return;
  mainDuration = Math.max(0, mainDuration + deltaSeconds);
  renderMain();
}

function toggleMain() {
  if (!started) {
    started = true;
    primeAudio();
  }
  mainRunning = !mainRunning;
  if (mainRunning) startLoop(); else stopLoop();
  renderMain();
  renderTeams();
}

// ================== EQUIPOS ==================

function toggleTeam(team) {
  if (!mainRunning) return;
  if (team === 'neutral') {
    activeTeam = null;
    renderTeams();
    return;
  }
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

  const scoreRed = Math.floor(timeRed / 5000);
  const scoreBlue = Math.floor(timeBlue / 5000);

  let winnerText;
  let winnerTeam = null;
  if (scoreRed === scoreBlue) winnerText = 'EMPATE';
  else if (scoreRed > scoreBlue) {
    winnerText = 'EQUIPO ROJO GANA';
    winnerTeam = 'red';
  } else {
    winnerText = 'EQUIPO AZUL GANA';
    winnerTeam = 'blue';
  }

  if (winnerTeam) registerGameWin(winnerTeam);

  modalWinner.textContent = winnerText;
  modalDetail.textContent = `${scoreRed} - ${scoreBlue} puntos`;
  modal.classList.add('show');
}

// ================== EVENTOS ==================

document.querySelectorAll('.btn-adjust').forEach((btn) => {
  btn.addEventListener('click', () => adjustDuration(parseInt(btn.dataset.adjust, 10)));
});

mainPlayPause.addEventListener('click', toggleMain);
teamRedEl.addEventListener('click', () => toggleTeam('red'));
teamBlueEl.addEventListener('click', () => toggleTeam('blue'));
neutralControlEl.addEventListener('click', () => toggleTeam('neutral'));
resetBtn.addEventListener('click', resetAll);
finishBtn.addEventListener('click', finishRound);
closeModal.addEventListener('click', () => modal.classList.remove('show'));

renderMain();
renderTeams();