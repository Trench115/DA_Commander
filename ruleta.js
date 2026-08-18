// ================== CONFIGURACIÓN ==================
// Las 6 opciones de la ruleta. Si algún día quieres cambiar alguna,
// solo tienes que editar esta lista (color: 'red' o 'white').

const rouletteOptions = [
  { label: 'Dominio', color: 'white' },
  { label: 'Roba las banderas', color: 'red' },
  { label: 'VIP', color: 'white' },
  { label: 'Punto caliente', color: 'red' },
  { label: 'TCT Patrulla', color: 'white' },
  { label: 'Captura la bandera', color: 'red' }
];

// La flecha está a la derecha de la rueda. Medimos los ángulos en sentido
// horario empezando desde arriba (igual que hace conic-gradient por
// defecto y CSS rotate()), así que "derecha" equivale a 90 grados.
const POINTER_ANGLE = 90;
const EXTRA_TURNS = 5; // vueltas de más para que se note el giro
const SPIN_DURATION_MS = 3200; // debe coincidir con la transición del CSS

const COLOR_MAP = {
  red: '#8a1f1f',
  white: '#eef2ea'
};

// ================== ELEMENTOS ==================

const wheel = document.getElementById('rouletteWheel');
const spinBtn = document.getElementById('spinBtn');
const resultBox = document.getElementById('rouletteResult');

let isSpinning = false;
let currentRotation = 0;

// ================== CONSTRUIR LA RUEDA ==================

function buildWheel() {
  const total = rouletteOptions.length;
  const segmentAngle = 360 / total;

  // Sectores de color, generados a partir de la lista de opciones
  const stops = rouletteOptions.map((option, index) => {
    const start = index * segmentAngle;
    const end = start + segmentAngle;
    const color = COLOR_MAP[option.color] || COLOR_MAP.red;
    return `${color} ${start}deg ${end}deg`;
  });
  wheel.style.background = `conic-gradient(${stops.join(', ')})`;

  // Etiquetas de texto: cada una es un "radio" que sale del centro
  // hacia el borde, rotado hasta el centro de su sector.
  wheel.innerHTML = '';
  rouletteOptions.forEach((option, index) => {
    const centerAngle = index * segmentAngle + segmentAngle / 2;
    const label = document.createElement('div');
    label.className = `roulette-label ${option.color}`;
    label.style.setProperty('--angle', `${centerAngle}deg`);
    label.textContent = option.label;
    wheel.appendChild(label);
  });
}

// ================== GIRAR ==================

function spin() {
  if (isSpinning) return;

  isSpinning = true;
  spinBtn.disabled = true;
  spinBtn.textContent = 'Girando...';
  resultBox.textContent = 'Sorteando...';

  const total = rouletteOptions.length;
  const segmentAngle = 360 / total;
  const winnerIndex = Math.floor(Math.random() * total);
  const winner = rouletteOptions[winnerIndex];
  const centerAngle = winnerIndex * segmentAngle + segmentAngle / 2;

  // Calculamos el giro necesario a partir de la posición ACTUAL de la
  // rueda (no solo desde 0), así siempre acierta con la flecha aunque
  // ya se haya girado varias veces antes.
  const currentMod = ((currentRotation % 360) + 360) % 360;
  const desiredMod = ((POINTER_ANGLE - centerAngle) % 360 + 360) % 360;
  let delta = ((desiredMod - currentMod) % 360 + 360) % 360;
  delta += 360 * EXTRA_TURNS;

  currentRotation += delta;
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    resultBox.textContent = winner.label;
    isSpinning = false;
    spinBtn.disabled = false;
    spinBtn.textContent = 'Girar';
  }, SPIN_DURATION_MS);
}

spinBtn.addEventListener('click', spin);

// ================== INICIO ==================

buildWheel();
resultBox.textContent = 'Pulsa girar para empezar';