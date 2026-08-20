const DEFAULT_MAIN_DURATION = 25 * 60;
const DEFAULT_ROUND_DURATION = 3 * 60;

let mainDuration = DEFAULT_MAIN_DURATION;
let mainElapsedMs = 0;
let mainRunning = false;
let mainStarted = false;
let mainEnded = false;
let matchFinished = false;
let roundDuration = DEFAULT_ROUND_DURATION;
let roundElapsedMs = 0;
let roundRunning = false;
let roundStarted = false;
let roundNumber = 1;
let scoreRed = 0;
let scoreBlue = 0;
let lastTick = null;
let loopId = null;

const mainTimerDisplay = document.getElementById('mainTimerDisplay');
const setupControls = document.getElementById('setupControls');
const scoreRedEl = document.getElementById('scoreRed');
const scoreBlueEl = document.getElementById('scoreBlue');
const roundNumberEl = document.getElementById('roundNumber');
const mainPlayPause = document.getElementById('mainPlayPause');
const roundTimerDisplay = document.getElementById('roundTimerDisplay');
const roundMinus = document.getElementById('roundMinus');
const roundPlus = document.getElementById('roundPlus');
const roundToggle = document.getElementById('roundToggle');
const roundFinish = document.getElementById('roundFinish');
const roundDecision = document.getElementById('roundDecision');
const resetBtn = document.getElementById('resetBtn');
const finishBtn = document.getElementById('finishBtn');
const modal = document.getElementById('modal');
const modalWinner = document.getElementById('modalWinner');
const modalDetail = document.getElementById('modalDetail');
const closeModal = document.getElementById('closeModal');

function renderMain() {
  const remainingMs = Math.max(0, mainDuration * 1000 - mainElapsedMs);
  mainTimerDisplay.textContent = formatTime(remainingMs);
  mainTimerDisplay.classList.toggle('overtime', mainEnded);
  scoreRedEl.textContent = String(scoreRed);
  scoreBlueEl.textContent = String(scoreBlue);
  roundNumberEl.textContent = String(roundNumber);
  setupControls.style.display = mainStarted ? 'none' : 'flex';
  mainPlayPause.textContent = mainRunning ? 'Pausar partida' : (mainStarted ? 'Reanudar partida' : 'Iniciar partida');
  mainPlayPause.classList.toggle('running', mainRunning);
  finishBtn.disabled = matchFinished;
}

function renderRound() {
  const remainingMs = Math.max(0, roundDuration * 1000 - roundElapsedMs);
  roundTimerDisplay.textContent = formatTime(remainingMs);
  roundTimerDisplay.classList.toggle('overtime', roundElapsedMs >= roundDuration * 1000);
  roundToggle.textContent = roundRunning ? 'Pausar ronda' : (roundStarted ? 'Reanudar ronda' : 'Iniciar ronda');
  roundToggle.classList.toggle('running', roundRunning);
  roundMinus.disabled = roundStarted;
  roundPlus.disabled = roundStarted;
  roundFinish.disabled = !roundStarted || roundRunning;
}

function renderDecision() {
  roundDecision.classList.toggle('show', roundStarted && !roundRunning);
}

function tick() {
  const now = Date.now();
  const delta = now - lastTick;
  lastTick = now;

  if (mainRunning) {
    mainElapsedMs += delta;
    if (mainElapsedMs >= mainDuration * 1000) {
      mainElapsedMs = mainDuration * 1000;
      mainRunning = false;
      mainEnded = true;
      roundRunning = false;
      finishRoundMatch();
      return;
    }
  }

  if (roundRunning) {
    roundElapsedMs += delta;
    if (roundElapsedMs >= roundDuration * 1000) {
      roundElapsedMs = roundDuration * 1000;
      roundRunning = false;
      beep();
    }
  }

  renderMain();
  renderRound();
  renderDecision();
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

function toggleMain() {
  if (mainEnded) return;
  if (!mainStarted) {
    mainStarted = true;
    primeAudio();
  }
  mainRunning = !mainRunning;
  if (mainRunning || roundRunning) startLoop();
  else stopLoop();
  renderMain();
}

function adjustRound(delta) {
  if (roundStarted) return;
  roundDuration = Math.max(30, roundDuration + delta);
  renderRound();
}

function toggleRound() {
  if (!mainStarted || mainEnded || (roundStarted && roundElapsedMs >= roundDuration * 1000)) return;
  if (!roundStarted) {
    roundStarted = true;
    primeAudio();
  }
  roundRunning = !roundRunning;
  if (roundRunning || mainRunning) startLoop();
  else stopLoop();
  renderRound();
  renderDecision();
}

function finishCurrentRound() {
  if (!roundStarted || roundRunning || mainEnded) return;
  renderDecision();
}

function chooseWinner(team) {
  if (!roundStarted || roundRunning || mainEnded) return;
  if (team === 'red') scoreRed += 1;
  if (team === 'blue') scoreBlue += 1;
  roundNumber += 1;
  roundDuration = DEFAULT_ROUND_DURATION;
  roundElapsedMs = 0;
  roundStarted = false;
  roundDecision.classList.remove('show');
  renderMain();
  renderRound();
  if (mainRunning) startLoop();
}

function finishRoundMatch() {
  if (matchFinished) return;
  matchFinished = true;
  roundDecision.classList.remove('show');
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
  modalDetail.textContent = `${scoreRed} - ${scoreBlue} puntos`;
  modal.classList.add('show');
}

function resetMatch() {
  stopLoop();
  mainDuration = DEFAULT_MAIN_DURATION;
  mainElapsedMs = 0;
  mainRunning = false;
  mainStarted = false;
  mainEnded = false;
  matchFinished = false;
  roundDuration = DEFAULT_ROUND_DURATION;
  roundElapsedMs = 0;
  roundRunning = false;
  roundStarted = false;
  roundNumber = 1;
  scoreRed = 0;
  scoreBlue = 0;
  modal.classList.remove('show');
  renderMain();
  renderRound();
  renderDecision();
}

document.querySelectorAll('.extremo-main-timer .btn-adjust').forEach((button) => {
  button.addEventListener('click', () => {
    if (!mainStarted) {
      mainDuration = Math.min(DEFAULT_MAIN_DURATION, Math.max(0, mainDuration + Number(button.dataset.adjust)));
      renderMain();
    }
  });
});
mainPlayPause.addEventListener('click', toggleMain);
roundMinus.addEventListener('click', () => adjustRound(-30));
roundPlus.addEventListener('click', () => adjustRound(30));
roundToggle.addEventListener('click', toggleRound);
roundFinish.addEventListener('click', finishCurrentRound);
document.querySelectorAll('[data-winner]').forEach((button) => {
  button.addEventListener('click', () => chooseWinner(button.dataset.winner));
});
resetBtn.addEventListener('click', resetMatch);
finishBtn.addEventListener('click', finishRoundMatch);
closeModal.addEventListener('click', () => modal.classList.remove('show'));

renderMain();
renderRound();
renderDecision();
