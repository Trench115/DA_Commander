// Funciones compartidas por todos los modos de juego

const TEAM_WIN_STORAGE_KEY = 'da_commander_team_wins';

function readTeamWins() {
  try {
    const raw = localStorage.getItem(TEAM_WIN_STORAGE_KEY);
    if (!raw) return { red: 0, blue: 0 };

    const parsed = JSON.parse(raw);
    return {
      red: Number(parsed.red) || 0,
      blue: Number(parsed.blue) || 0,
    };
  } catch (error) {
    return { red: 0, blue: 0 };
  }
}

function writeTeamWins(nextState) {
  const safeState = {
    red: Math.max(0, Number(nextState.red) || 0),
    blue: Math.max(0, Number(nextState.blue) || 0),
  };

  try {
    localStorage.setItem(TEAM_WIN_STORAGE_KEY, JSON.stringify(safeState));
  } catch (error) {
    // Ignoramos errores de almacenamiento en navegadores sin acceso a localStorage.
  }

  return safeState;
}

function getTeamWins() {
  return readTeamWins();
}

function changeTeamWins(team, delta) {
  const current = readTeamWins();
  const next = {
    ...current,
    [team]: Math.max(0, (current[team] || 0) + Number(delta || 0)),
  };
  return writeTeamWins(next);
}

function registerGameWin(team) {
  if (team !== 'red' && team !== 'blue') return getTeamWins();
  return changeTeamWins(team, 1);
}

function resetTeamWins() {
  return writeTeamWins({ red: 0, blue: 0 });
}

function formatTime(ms) {
  const totalSec = Math.floor(Math.abs(ms) / 1000);
  const min = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const sec = (totalSec % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

// Pitido de aviso. Funciona en iPhone porque el AudioContext se "prepara"
// en el primer toque a Iniciar (un gesto real del usuario).
let audioCtx = null;

function primeAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function beep() {
  if (!audioCtx) return;

  const tones = [1320, 990, 1320];
  tones.forEach((frequency, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime + index * 0.22);
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + index * 0.22);
    gain.gain.linearRampToValueAtTime(0.9, audioCtx.currentTime + index * 0.22 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + index * 0.22 + 0.18);
    osc.start(audioCtx.currentTime + index * 0.22);
    osc.stop(audioCtx.currentTime + index * 0.22 + 0.18);
  });
}

// Registro común del Service Worker (modo offline)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}