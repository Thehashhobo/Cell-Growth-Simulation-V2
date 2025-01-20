# Cell Growth Simulation V2 (Original Version at [Cell Growth Simulation V1](https://github.com/Thehashhobo/Cell-Growth-Simulation))
An enhanced version of the Cell Growth Simulation that includes optimized rendering for larger grids and improved performance. Leveraging a Canvas rendering approach, this release reduces the need for large number of DOM objects. The result is a smoother simulation experience, even when exploring bigger dimensions containing up to 100 million cells (with caution around browser canvas limits).

#### The website is hosted on github pages: https://thehashhobo.github.io/Cell-Growth-Simulation-V2/
## Features
- Canvas-Based Rendering: Replaces the traditional DOM-based cell representation with a single canvas element, eliminating the node-limit overhead and performance bottlenecks of large DOM trees.
- Partial Rendering: Only re-draws cells that have changed state on each iteration, reducing redundant computations and improving scalability for larger grids.
- Full Re-Initialization Performed only when strictly necessary—e.g., during browser window resizing—to reset and realign the entire canvas layout.
- Delta-Based Updates: Maintains a “frontier” set (potentialCells) of cells that can affect subsequent growth cycles, thus focusing calculations and rendering solely on changed or newly influenced areas.
- Real-Time Interactive Grid: Allows toggling of individual cells (occupied or unoccupied) at any point, providing immediate visual feedback without restarting the simulation.
- Adjustable Simulation Controls: Offers start/pause, reset, and user-defined parameters (grid dimensions, growth interval) to adapt the simulation’s runtime behavior.


# Setup and Run Instructions
### Prerequisites
Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v18.x or later)
- [npm](https://www.npmjs.com/) (v9.x or later)

### Installation
1. Clone the repository to your local machine: \
`git clone https://github.com/Thehashhobo/Cell-Growth-Simulation-V2.git`
### Running the application
2. Navigate to the project directory: \
`cd Cell-Growth-Simulation-V2`
3. Install Dependencies(Note that warnings from deprecated dependencies can be safely ignore due to simplicity of this project): \
`npm install`
4. Start the development server: Open your browser and navigate to http://localhost:3000 to view the application: \
`npm run dev`


