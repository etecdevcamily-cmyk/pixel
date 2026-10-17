// Motor partilhado das fases 2 a 5.
// Cada ficheiro de fase define window.LEVEL.
const { maze, next, fog } = window.LEVEL;

const canvas = document.getElementById("maze");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("gameStatus");
const cell = canvas.width / maze.length;
const goal = { x: maze.length - 2, y: maze.length - 2 };

let player = { x: 1, y: 1 };
let gameWon = false;
let audioContext = null;

function unlockAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!audioContext) audioContext = new AudioContextClass();

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
}

function playMoveSound(dx, dy) {
  unlockAudio();
  if (!audioContext) return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const volume = audioContext.createGain();

  let frequency = 500;
  if (dy < 0) frequency = 620;
  if (dy > 0) frequency = 440;
  if (dx < 0) frequency = 520;
  if (dx > 0) frequency = 680;

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(frequency, now);

  volume.gain.setValueAtTime(0.0001, now);
  volume.gain.exponentialRampToValueAtTime(0.06, now + 0.008);
  volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

  oscillator.connect(volume);
  volume.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.08);
}

function drawMaze() {
  const unit = cell / 30;

  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      const px = x * cell;
      const py = y * cell;

      if (fog && Math.hypot(x - player.x, y - player.y) > fog) {
        ctx.fillStyle = "#02060d";
        ctx.fillRect(px, py, cell, cell);
        continue;
      }

      if (maze[y][x] === 1) {
        ctx.fillStyle = "#102344";
        ctx.fillRect(px, py, cell, cell);

        ctx.fillStyle = "#244878";
        ctx.fillRect(
          px + 3 * unit,
          py + 3 * unit,
          cell - 6 * unit,
          cell - 6 * unit
        );
      } else {
        ctx.fillStyle = "#050b16";
        ctx.fillRect(px, py, cell, cell);
      }
    }
  }

  // Coração de destino em pixel art
  const goalX = goal.x * cell;
  const goalY = goal.y * cell;

  ctx.fillStyle = "#ff304f";
  ctx.fillRect(goalX + 7 * unit, goalY + 8 * unit, 7 * unit, 7 * unit);
  ctx.fillRect(goalX + 16 * unit, goalY + 8 * unit, 7 * unit, 7 * unit);
  ctx.fillRect(goalX + 5 * unit, goalY + 13 * unit, 20 * unit, 7 * unit);
  ctx.fillRect(goalX + 9 * unit, goalY + 20 * unit, 12 * unit, 5 * unit);
  ctx.fillRect(goalX + 13 * unit, goalY + 25 * unit, 4 * unit, 3 * unit);

  // Personagem
  const playerX = player.x * cell;
  const playerY = player.y * cell;

  ctx.fillStyle = "#ff304f";
  ctx.fillRect(playerX + 7 * unit, playerY + 6 * unit, 16 * unit, 18 * unit);

  ctx.fillStyle = "#ffd6dc";
  ctx.fillRect(playerX + 10 * unit, playerY + 9 * unit, 10 * unit, 8 * unit);

  ctx.fillStyle = "#081326";
  ctx.fillRect(playerX + 12 * unit, playerY + 11 * unit, 2 * unit, 3 * unit);
  ctx.fillRect(playerX + 17 * unit, playerY + 11 * unit, 2 * unit, 3 * unit);
}

function movePlayer(dx, dy) {
  if (gameWon) return;

  const nextX = player.x + dx;
  const nextY = player.y + dy;

  if (maze[nextY]?.[nextX] !== 0) return;

  player = { x: nextX, y: nextY };
  playMoveSound(dx, dy);
  drawMaze();

  if (nextX === goal.x && nextY === goal.y) {
    gameWon = true;
    statusText.textContent = "Destino encontrado!";

    window.setTimeout(() => {
      location.href = next;
    }, 350);
  }
}

document.querySelectorAll(".direction").forEach(button => {
  button.addEventListener("click", () => {
    movePlayer(Number(button.dataset.dx), Number(button.dataset.dy));
  });

  button.addEventListener("dblclick", event => event.preventDefault());
});

const moves = {
  arrowup: [0, -1],
  w: [0, -1],
  arrowdown: [0, 1],
  s: [0, 1],
  arrowleft: [-1, 0],
  a: [-1, 0],
  arrowright: [1, 0],
  d: [1, 0]
};

window.addEventListener("keydown", event => {
  const move = moves[event.key.toLowerCase()];

  if (move) {
    event.preventDefault();
    movePlayer(...move);
  }
});

document.addEventListener("pointerdown", unlockAudio, { once: true });

drawMaze();
