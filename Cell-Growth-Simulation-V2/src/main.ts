const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("2D context not available.");

// HTML elements
const widthInput = document.getElementById("gridWidth") as HTMLInputElement;
const heightInput = document.getElementById("gridHeight") as HTMLInputElement;
const intervalInput = document.getElementById("interval") as HTMLInputElement;
const pixelSizeInput = document.getElementById("pixel") as HTMLButtonElement;
const startPauseBtn = document.getElementById("startPauseBtn") as HTMLButtonElement;
const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
const modal = document.getElementById("settingsModal");
const closeButton = document.getElementsByClassName("close")[0] as HTMLButtonElement;
const openModalBtn = document.getElementById("openModalBtn") as HTMLButtonElement;


// Simulation default config
let cellSize = parseInt(pixelSizeInput.value, 10);      
let gridWidth = 30;        // # of columns
let gridHeight = 30;       

// The grid: grid[row][col] = boolean (false=dead, true=alive)
let grid: boolean[][] = [];

// A set of "row,col" strings representing cells with growth potential
let potentialCells = new Set<string>();

let isRunning = false;          
let stepTimer: number | null = null;       

//---------------------
// Initialization
//---------------------

// Create an empty grid (all false). Clear potentialCells. 
function initGrid() {
  grid = [];
  for (let r = 0; r < gridHeight; r++) {
    const rowArray = new Array(gridWidth).fill(false);
    grid.push(rowArray);
  }
  potentialCells.clear();
}

// Draw the entire canvas in white with grid lines (assume the grid is empty).
function drawInitGrid() {
  if (!ctx) return;

  // Match canvas size to the grid dimension
  canvas.width = gridWidth * cellSize;
  canvas.height = gridHeight * cellSize;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid lines
  ctx.strokeStyle = "#ccc";
  // vertical lines
  for (let c = 0; c <= gridWidth; c++) {
    const xPos = c * cellSize;
    ctx.beginPath();
    ctx.moveTo(xPos, 0);
    ctx.lineTo(xPos, canvas.height);
    ctx.stroke();
  }
  // horizontal lines
  for (let r = 0; r <= gridHeight; r++) {
    const yPos = r * cellSize;
    ctx.beginPath();
    ctx.moveTo(0, yPos);
    ctx.lineTo(canvas.width, yPos);
    ctx.stroke();
  }
}


// On window resize => pause simulation + and redraw entire canvas.
function handleWindowResize() {
  if (isRunning) {
    pauseSimulation();
  }
  // Re-draw the entire grid from scratch
  drawInitGrid();

  // Re-draw any existing cells
  for (let r = 0; r < gridHeight; r++) {
    for (let c = 0; c < gridWidth; c++) {
      if (grid[r][c]) {
        drawCell(r, c, true); // paint it green
      }
    }
  }
}


// Handles Draw or erase a single cell at (row, col) based on its current state.
// Used by partial re-renders.
function drawCell(row: number, col: number, alive: boolean) {
  if (!ctx) return;
  ctx.fillStyle = alive ? "green" : "white";
  ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);

  // optional boundary in case we overwrote it
  ctx.strokeStyle = "#ccc";
  ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
}

//---------------------
// Simulation Logic
//---------------------


// Handles partial re-render:
// Loop through potentialCells, set them + neighbors alive.
// Then add new PotentialCells for the next iteration.
function simulateStep() {

  // first check if the grid is filled to stop the simulation.
  if (isGridFilled()) {
    pauseSimulation();
    return;
  } 

  const newGrid = grid.map(row => row.slice());
  const newPotentialCells = new Set<string>();

  potentialCells.forEach(cellKey => {
    const [rStr, cStr] = cellKey.split(",");
    const r = parseInt(rStr, 10);
    const c = parseInt(cStr, 10);

    // Mark the cell alive
    if (!newGrid[r][c]) {
      newGrid[r][c] = true;
      drawCell(r, c, true); // partial re-draw
    }

    // Occupy neighbors
    const neighbors = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];
    neighbors.forEach(([nr, nc]) => {
      if (nr >= 0 && nr < gridHeight && nc >= 0 && nc < gridWidth) {
        if (!newGrid[nr][nc]) {
          newGrid[nr][nc] = true;
          // partial re-draw
          drawCell(nr, nc, true);
          // mark neighbor as a new potential cell
          newPotentialCells.add(`${nr},${nc}`);
        }
      }
    });
  });

  // Update potential set
  potentialCells.clear();
  potentialCells = newPotentialCells;

  grid = newGrid;

  

  if (isRunning) {
    stepTimer = window.setTimeout(simulateStep, intervalInput.valueAsNumber);
  }
}

//---------------------
// Toggling + Interactions
//---------------------


// Handles User Toggling a cell's state. 
// If it becomes alive => add to potentialCells.
// If it becomes dead => remove from potentialCells and re-add neighbors.
function toggleCell(row: number, col: number) {
  const oldVal = grid[row][col];
  const newVal = !oldVal;

  grid[row][col] = newVal;
  drawCell(row, col, newVal);

  const cellKey = `${row},${col}`;
  const neighbors = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];

  if (!oldVal && newVal) {
    potentialCells.add(cellKey);

  } else if (oldVal && !newVal) {
    potentialCells.delete(cellKey);
    neighbors.forEach(([nr, nc]) => {
      if (nr >= 0 && nr < gridHeight && nc >= 0 && nc < gridWidth) {
        if (grid[nr][nc]) {
          potentialCells.add(`${nr},${nc}`);
        }
      }
    });
  }
}

//---------------------
// /CellSize/Start/Pause/Reset
//---------------------
function handlePixelSizeChange() {
  cellSize = parseInt(pixelSizeInput.value, 10);
  resetSimulation();
}

function startSimulation() {
  if (isRunning) return; 
  isRunning = true;
  startPauseBtn.textContent = "Pause";
  simulateStep(); 
}

function pauseSimulation() {
  if (!isRunning) return;
  isRunning = false;
  startPauseBtn.textContent = "Start";
  if (stepTimer) {
    clearTimeout(stepTimer);
    stepTimer = null;
  }
}

function isGridFilled() {
  const cornersAndCenter = [
    [0, 0], // top-left corner
    [0, gridWidth - 1], // top-right corner
    [gridHeight - 1, 0], // bottom-left corner
    [gridHeight - 1, gridWidth - 1], // bottom-right corner
    [Math.floor(gridHeight / 2), Math.floor(gridWidth / 2)] // center
  ];

  return cornersAndCenter.every(([row, col]) => grid[row][col]);
}

// Resets to empty grid, re-initialize, and pause.
function resetSimulation() {
  pauseSimulation();
  gridWidth = Math.max(5, parseInt(widthInput.value, 10));
  gridHeight = Math.max(5, parseInt(heightInput.value, 10));

  initGrid();
  drawInitGrid();
}

//---------------------
// Event Listeners
//---------------------
startPauseBtn.addEventListener("click", () => {
  if (isRunning) {
    pauseSimulation();
  } else {
    startSimulation();
  }
});

resetBtn.addEventListener("click", () => {
  resetSimulation();
});

widthInput.addEventListener("change", resetSimulation);
heightInput.addEventListener("change", resetSimulation);
intervalInput.addEventListener("change", pauseSimulation);
pixelSizeInput.addEventListener("click", handlePixelSizeChange);

canvas.addEventListener("click", (e: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const col = Math.floor(mouseX / cellSize);
  const row = Math.floor(mouseY / cellSize);

  if (row >= 0 && row < gridHeight && col >= 0 && col < gridWidth) {
    toggleCell(row, col);
  }
});

window.addEventListener("resize", () => {
  handleWindowResize();
});


openModalBtn.onclick = function() {
  if (!modal) return;
  modal.style.display = "block";
}

closeButton.onclick = function() {
  if (!modal) return;
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (!modal) return;
  if (event.target == modal) {
    modal.style.display = "none";
  }
}



//---------------------
// Initialize on Load
//---------------------
resetSimulation();
