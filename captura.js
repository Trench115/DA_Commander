// ================== ESTADO ==================

let mainDuration = 15 * 60;
let mainElapsedMs = 0;
let mainRunning = false;
let started = false;
let overtimeAlerted = false;

let scoreRed = 0;
let scoreBlue = 0;

let lastTick = null;
let loopId = null;

// ================== ELEMENTOS ==================

const mainTimerDisplay = document.getElementById('mainTimerDisplay');
const setupControls = document.getElementById('setupControls');
const mainPlayPause = document.getElementById('mainPlayPause');
const scoreRedEl = document.getElementById('scoreRed');
const scoreBlueEl = document.getElementById('scoreBlue');
const resetBtn = document.getElementById('resetBtn');
const finishBtn = document.getElementById('finishBtn');
const modal = document.getElementById('modal');
const modalWinner = document.getElementById('modalWinner');
const modalDetail = document.getElementById('modalDetail');
const closeModal = document.getElementById('closeModal');
const minusRedBtn = document.getElementById('minusRed');
const minusBlueBtn = document.getElementById('minusBlue');
const scoreCardRed = document.getElementById('scoreCardRed');
const scoreCardBlue = document.getElementById('scoreCardBlue');

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

function renderScores() {
  scoreRedEl.textContent = String(scoreRed);
  scoreBlueEl.textContent = String(scoreBlue);
}

// ================== BUCLE ==================

function tick() {
  const now = Date.now();
  const delta = now - lastTick;
  lastTick = now;

  mainElapsedMs += delta;
  renderMain();
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
  if (mainRunning) {
    startLoop();
  } else {
    stopLoop();
  }

  renderMain();
}

// ================== PUNTOS ==================

function changeScore(team, delta) {
  if (team === 'red') {
    scoreRed = Math.max(0, scoreRed + delta);
  } else if (team === 'blue') {
    scoreBlue = Math.max(0, scoreBlue + delta);
  }
  renderScores();
}

function handleScoreButton(team, delta) {
  if (!started) return;
  changeScore(team, delta);
}

// ================== RESET / FINALIZAR ==================

function resetRound() {
  mainElapsedMs = 0;
  mainRunning = false;
  started = false;
  overtimeAlerted = false;
  scoreRed = 0;
  scoreBlue = 0;
  stopLoop();
  renderMain();
  renderScores();
}

function finishRound() {
  mainRunning = false;
  stopLoop();

  let winnerText = 'EMPATE';
  let winnerTeam = null;

  if (scoreRed > scoreBlue) {
    winnerText = 'EQUIPO ROJO GANA';
    winnerTeam = 'red';
  } else if (scoreBlue > scoreRed) {
    winnerText = 'EQUIPO AZUL GANA';
    winnerTeam = 'blue';
  }

  if (winnerTeam) registerGameWin(winnerTeam);

  modalWinner.textContent = winnerText;
  modalDetail.textContent = `${scoreRed} - ${scoreBlue} capturas`;
  modal.classList.add('show');
}

// ================== EVENTOS ==================

document.querySelectorAll('.btn-adjust').forEach((btn) => {
  btn.addEventListener('click', () => adjustDuration(parseInt(btn.dataset.adjust, 10)));
});

mainPlayPause.addEventListener('click', toggleMain);
minusRedBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  handleScoreButton('red', -1);
});
minusBlueBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  handleScoreButton('blue', -1);
});
scoreCardRed.addEventListener('click', (event) => {
  if (event.target.closest('.btn-minus')) return;
  handleScoreButton('red', 1);
});
scoreCardBlue.addEventListener('click', (event) => {
  if (event.target.closest('.btn-minus')) return;
  handleScoreButton('blue', 1);
});
resetBtn.addEventListener('click', resetRound);
finishBtn.addEventListener('click', finishRound);
closeModal.addEventListener('click', () => modal.classList.remove('show'));

renderMain();
renderScores();
