const rouletteOptions = [
  { id: 'punto-caliente', label: 'Punto caliente', color: 'white' },
  { id: 'captura-bandera', label: 'Captura la bandera', color: 'red' },
  { id: 'roba-bandera', label: 'Roba la bandera', color: 'white' },
  { id: 'vip', label: 'VIP', color: 'red' },
  { id: 'tct-patrulla', label: 'TCT Patrulla', color: 'white' },
  { id: 'dominio', label: 'Dominio', color: 'red' }
];

const wheel = document.getElementById('rouletteWheel');
const spinBtn = document.getElementById('spinBtn');
const resultBox = document.getElementById('rouletteResult');

let isSpinning = false;
let currentRotation = 0;

function buildWheel() {
  const segmentAngle = 360 / rouletteOptions.length;
  wheel.innerHTML = '';

  rouletteOptions.forEach((option, index) => {
    const angle = index * segmentAngle + segmentAngle / 2 - 90;
    const label = document.createElement('div');
    label.className = `roulette-label ${option.color}`;
    label.style.setProperty('--angle', `${angle}deg`);
    label.textContent = option.label;
    wheel.appendChild(label);
  });
}

function pickRandomOption() {
  const winner = rouletteOptions[Math.floor(Math.random() * rouletteOptions.length)];
  if (!winner) return null;

  const segmentAngle = 360 / rouletteOptions.length;
  const winnerIndex = rouletteOptions.findIndex((item) => item.id === winner.id);
  const pointerOffset = 90;
  const targetCenter = (winnerIndex + 0.5) * segmentAngle;
  const targetAngle = 360 - (targetCenter + pointerOffset) + 360 * 6;
  currentRotation += targetAngle;

  wheel.style.transform = `rotate(${currentRotation}deg)`;
  return winner;
}

function spinWheel() {
  if (isSpinning) return;

  isSpinning = true;
  spinBtn.disabled = true;
  spinBtn.textContent = 'Girando...';
  resultBox.textContent = 'Sorteando...';

  const winner = pickRandomOption();

  setTimeout(() => {
    if (winner) {
      resultBox.textContent = winner.label;
    }
    isSpinning = false;
    spinBtn.disabled = false;
    spinBtn.textContent = 'Girar';
  }, 3300);
}

spinBtn.addEventListener('click', spinWheel);

buildWheel();
resultBox.textContent = 'Pulsa girar para empezar';
