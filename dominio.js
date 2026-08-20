const MAX_SCORE = 1000;
const POINTS_PER_SECOND_PER_FLAG = MAX_SCORE / (25 * 60);

let mainDuration = 25 * 60;
let mainElapsedMs = 0;
let mainRunning = false;
let started = false;
let matchFinished = false;
let overtimeAlerted = false;
let scoreRed = MAX_SCORE;
let scoreBlue = MAX_SCORE;
let flagOwners = { a: 'neutral', b: 'neutral', c: 'neutral' };
let lastTick = null;
let loopId = null;

const mainTimerDisplay = document.getElementById('mainTimerDisplay');
const setupControls = document.getElementById('setupControls');
const mainPlayPause = document.getElementById('mainPlayPause');
const scoreRedEl = document.getElementById('scoreRed');
const scoreBlueEl = document.getElementById('scoreBlue');
const barRedEl = document.getElementById('barRed');
const barBlueEl = document.getElementById('barBlue');
const resetBtn = document.getElementById('resetBtn');
const finishBtn = document.getElementById('finishBtn');
const modal = document.getElementById('modal');
const modalWinner = document.getElementById('modalWinner');
const modalDetail = document.getElementById('modalDetail');
const closeModal = document.getElementById('closeModal');

function countFlags(team) {
  return Object.values(flagOwners).filter((owner) => owner === team).length;
}

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
  finishBtn.disabled = matchFinished;
}

function renderScores() {
  scoreRedEl.textContent = String(Math.ceil(scoreRed));
  scoreBlueEl.textContent = String(Math.ceil(scoreBlue));
  barRedEl.style.width = `${Math.max(0, scoreRed / MAX_SCORE * 100)}%`;
  barBlueEl.style.width = `${Math.max(0, scoreBlue / MAX_SCORE * 100)}%`;

  document.querySelectorAll('.dominio-flag-row').forEach((row) => {
    const owner = flagOwners[row.dataset.flag];
    row.classList.toggle('owned-red', owner === 'red');
    row.classList.toggle('owned-blue', owner === 'blue');
    row.querySelectorAll('[data-team]').forEach((button) => {
      button.classList.toggle('selected', button.dataset.team === owner);
    });
  });
}

function tick() {
  const now = Date.now();
  const delta = now - lastTick;
  lastTick = now;

  mainElapsedMs += delta;
  scoreRed = Math.max(0, scoreRed - countFlags('blue') * POINTS_PER_SECOND_PER_FLAG * delta / 1000);
  scoreBlue = Math.max(0, scoreBlue - countFlags('red') * POINTS_PER_SECOND_PER_FLAG * delta / 1000);

  renderMain();
  renderScores();

  if (scoreRed <= 0 || scoreBlue <= 0 || mainElapsedMs >= mainDuration * 1000) {
    finishRound();
    return;
  }

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

function adjustDuration(deltaSeconds) {
  if (started) return;
  mainDuration = Math.min(25 * 60, Math.max(0, mainDuration + deltaSeconds));
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
}

function setFlagOwner(row, owner) {
  flagOwners[row.dataset.flag] = owner;
  renderScores();
}

function resetRound() {
  mainElapsedMs = 0;
  mainRunning = false;
  started = false;
  matchFinished = false;
  overtimeAlerted = false;
  scoreRed = MAX_SCORE;
  scoreBlue = MAX_SCORE;
  flagOwners = { a: 'neutral', b: 'neutral', c: 'neutral' };
  stopLoop();
  modal.classList.remove('show');
  renderMain();
  renderScores();
}

function finishRound() {
  if (matchFinished || (!mainRunning && !started)) return;
  matchFinished = true;
  mainRunning = false;
  stopLoop();
  renderScores();

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
  modalDetail.textContent = `${Math.ceil(scoreRed)} - ${Math.ceil(scoreBlue)} puntos`;
  modal.classList.add('show');
}

document.querySelectorAll('.btn-adjust').forEach((button) => {
  button.addEventListener('click', () => adjustDuration(Number(button.dataset.adjust)));
});

document.querySelectorAll('.dominio-flag-row').forEach((row) => {
  row.querySelectorAll('[data-team]').forEach((button) => {
    button.addEventListener('click', () => setFlagOwner(row, button.dataset.team));
  });
});

mainPlayPause.addEventListener('click', toggleMain);
resetBtn.addEventListener('click', resetRound);
finishBtn.addEventListener('click', finishRound);
closeModal.addEventListener('click', () => modal.classList.remove('show'));

renderMain();
renderScores();
