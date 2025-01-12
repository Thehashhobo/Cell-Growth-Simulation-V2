// cellSimulation.ts

// Grid (absolute) dimensions
const GRID_ROWS = 400;
const GRID_COLS = 400;
const CELL_SIZE = 10; // each cell is 10x10 px

// We'll store 0 = dead, 1 = alive
const grid = new Uint8Array(GRID_ROWS * GRID_COLS);

// Offsets (in pixels) to pan the viewport around
let offsetX = 0;
let offsetY = 0;

// We'll set these later in initCellSimulation
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null = null;

/** Helper: Convert (row, col) => index in grid array */
function getIndex(row: number, col: number): number {
  return row * GRID_COLS + col;
}

/** Fill the grid with random living cells (20% chance to be alive) */
function randomizeGrid(): void {
  for (let i = 0; i < grid.length; i++) {
    grid[i] = Math.random() < 0.2 ? 1 : 0;
  }
}

/** Main draw function */
function draw(): void {
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // figure out which portion of the grid is visible
  const firstVisibleCol = Math.floor(offsetX / CELL_SIZE);
  const firstVisibleRow = Math.floor(offsetY / CELL_SIZE);

  const visibleCols = Math.ceil(canvas.width / CELL_SIZE);
  const visibleRows = Math.ceil(canvas.height / CELL_SIZE);

  const lastVisibleCol = Math.min(firstVisibleCol + visibleCols, GRID_COLS);
  const lastVisibleRow = Math.min(firstVisibleRow + visibleRows, GRID_ROWS);

  // draw each visible cell
  for (let row = firstVisibleRow; row < lastVisibleRow; row++) {
    for (let col = firstVisibleCol; col < lastVisibleCol; col++) {
      const cellState = grid[getIndex(row, col)];
      ctx.fillStyle = cellState === 1 ? "green" : "#ffffff";

      const xPos = col * CELL_SIZE - offsetX;
      const yPos = row * CELL_SIZE - offsetY;
      ctx.fillRect(xPos, yPos, CELL_SIZE, CELL_SIZE);
    }
  }

  // (Optional) draw grid lines
  ctx.strokeStyle = "#ccc";
  // vertical lines
  for (let col = firstVisibleCol; col <= lastVisibleCol; col++) {
    const xPos = col * CELL_SIZE - offsetX;
    ctx.beginPath();
    ctx.moveTo(xPos, -offsetY);
    ctx.lineTo(xPos, canvas.height - offsetY);
    ctx.stroke();
  }
  // horizontal lines
  for (let row = firstVisibleRow; row <= lastVisibleRow; row++) {
    const yPos = row * CELL_SIZE - offsetY;
    ctx.beginPath();
    ctx.moveTo(-offsetX, yPos);
    ctx.lineTo(canvas.width - offsetX, yPos);
    ctx.stroke();
  }
}

/** Resize callback */
function resizeCanvas(): void {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}

/** Initializes the simulation, sets up canvas, etc. */
export function initCellSimulation(): void {
  // Grab the canvas
  canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
  if (!canvas) {
    console.error("Canvas element #simCanvas not found");
    return;
  }

  ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to get 2D context.");
    return;
  }

  // Randomize the grid so we can see something
  randomizeGrid();

  // Set canvas size initially & on resize
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas(); // call once now

  // handle clicks (toggle cell state)
  canvas.addEventListener("click", (e: MouseEvent) => {
    console.log("click", e);
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const col = Math.floor((mouseX + offsetX) / CELL_SIZE);
    const row = Math.floor((mouseY + offsetY) / CELL_SIZE);

    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
      const index = getIndex(row, col);
      grid[index] = grid[index] === 1 ? 0 : 1;
      draw();
    }
  });

  // handle panning with arrow keys
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    const panStep = 50; // how many pixels to pan
    switch (e.key) {
      case "ArrowUp":
        offsetY = Math.max(0, offsetY - panStep);
        break;
      case "ArrowDown":
        offsetY = Math.min(offsetY + panStep, GRID_ROWS * CELL_SIZE - canvas.height);
        break;
      case "ArrowLeft":
        offsetX = Math.max(0, offsetX - panStep);
        break;
      case "ArrowRight":
        offsetX = Math.min(offsetX + panStep, GRID_COLS * CELL_SIZE - canvas.width);
        break;
      default:
        return;
    }
    draw();
  });
}

