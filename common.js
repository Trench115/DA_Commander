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

  const tones = [880, 660, 880];
  tones.forEach((frequency, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime + index * 0.22);
    gain.gain.setValueAtTime(0, audioCtx.currentTime + index * 0.22);
    gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + index * 0.22 + 0.02);
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