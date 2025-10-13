// Maze generation utility using recursive backtracking algorithm
class MazeGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.initialize();
    }

    initialize() {
        // Create grid filled with walls
        this.grid = [];
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = {
                    x: x,
                    y: y,
                    walls: {
                        top: true,
                        right: true,
                        bottom: true,
                        left: true
                    },
                    visited: false
                };
            }
        }
    }

    generate() {
        const stack = [];
        let current = this.grid[0][0];
        current.visited = true;

        while (true) {
            const next = this.getRandomUnvisitedNeighbor(current);
            
            if (next) {
                stack.push(current);
                this.removeWallBetween(current, next);
                next.visited = true;
                current = next;
            } else if (stack.length > 0) {
                current = stack.pop();
            } else {
                break;
            }
        }

        return this.grid;
    }

    getRandomUnvisitedNeighbor(cell) {
        const neighbors = [];
        const { x, y } = cell;

        // Check all four directions
        if (y > 0 && !this.grid[y - 1][x].visited) {
            neighbors.push(this.grid[y - 1][x]); // Top
        }
        if (x < this.width - 1 && !this.grid[y][x + 1].visited) {
            neighbors.push(this.grid[y][x + 1]); // Right
        }
        if (y < this.height - 1 && !this.grid[y + 1][x].visited) {
            neighbors.push(this.grid[y + 1][x]); // Bottom
        }
        if (x > 0 && !this.grid[y][x - 1].visited) {
            neighbors.push(this.grid[y][x - 1]); // Left
        }

        return neighbors.length > 0 ? 
            neighbors[Math.floor(Math.random() * neighbors.length)] : 
            null;
    }

    removeWallBetween(current, next) {
        const dx = current.x - next.x;
        const dy = current.y - next.y;

        if (dx === 1) {
            // Current is to the right of next
            current.walls.left = false;
            next.walls.right = false;
        } else if (dx === -1) {
            // Current is to the left of next
            current.walls.right = false;
            next.walls.left = false;
        } else if (dy === 1) {
            // Current is below next
            current.walls.top = false;
            next.walls.bottom = false;
        } else if (dy === -1) {
            // Current is above next
            current.walls.bottom = false;
            next.walls.top = false;
        }
    }

    // Convert maze to simple 2D array for collision detection
    toCollisionGrid() {
        const collisionGrid = [];
        const gridHeight = this.height * 2 + 1;
        const gridWidth = this.width * 2 + 1;

        // Initialize with walls
        for (let y = 0; y < gridHeight; y++) {
            collisionGrid[y] = [];
            for (let x = 0; x < gridWidth; x++) {
                collisionGrid[y][x] = 1; // Wall
            }
        }

        // Carve out paths
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                const gridX = x * 2 + 1;
                const gridY = y * 2 + 1;

                // Mark cell as path
                collisionGrid[gridY][gridX] = 0;

                // Remove walls based on cell walls
                if (!cell.walls.top && gridY > 0) {
                    collisionGrid[gridY - 1][gridX] = 0;
                }
                if (!cell.walls.right && gridX < gridWidth - 1) {
                    collisionGrid[gridY][gridX + 1] = 0;
                }
                if (!cell.walls.bottom && gridY < gridHeight - 1) {
                    collisionGrid[gridY + 1][gridX] = 0;
                }
                if (!cell.walls.left && gridX > 0) {
                    collisionGrid[gridY][gridX - 1] = 0;
                }
            }
        }

        return collisionGrid;
    }

    // Get random empty position for placing items
    getRandomEmptyPosition(collisionGrid) {
        const emptyPositions = [];
        
        for (let y = 0; y < collisionGrid.length; y++) {
            for (let x = 0; x < collisionGrid[y].length; x++) {
                if (collisionGrid[y][x] === 0) {
                    emptyPositions.push({ x, y });
                }
            }
        }

        return emptyPositions.length > 0 ? 
            emptyPositions[Math.floor(Math.random() * emptyPositions.length)] : 
            { x: 1, y: 1 };
    }

    // Find path from start to end (for ensuring solvability)
    findPath(start, end, collisionGrid) {
        // Simple breadth-first search
        const queue = [{ x: start.x, y: start.y, path: [] }];
        const visited = new Set();

        while (queue.length > 0) {
            const current = queue.shift();
            const key = `${current.x},${current.y}`;

            if (visited.has(key)) continue;
            visited.add(key);

            if (current.x === end.x && current.y === end.y) {
                return current.path.length;
            }

            // Check all four directions
            const directions = [
                { dx: 0, dy: -1 }, // Up
                { dx: 1, dy: 0 },  // Right
                { dx: 0, dy: 1 },  // Down
                { dx: -1, dy: 0 }  // Left
            ];

            for (const dir of directions) {
                const newX = current.x + dir.dx;
                const newY = current.y + dir.dy;

                if (newX >= 0 && newX < collisionGrid[0].length &&
                    newY >= 0 && newY < collisionGrid.length &&
                    collisionGrid[newY][newX] === 0) {
                    
                    queue.push({
                        x: newX,
                        y: newY,
                        path: [...current.path, { x: newX, y: newY }]
                    });
                }
            }
        }

        return -1; // No path found
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MazeGenerator;
}
