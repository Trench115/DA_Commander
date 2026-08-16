// Funciones compartidas por todos los modos de juego

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
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
}

// Registro común del Service Worker (modo offline)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}