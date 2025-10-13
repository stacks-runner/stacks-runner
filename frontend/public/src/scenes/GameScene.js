// Game Scene - Core gameplay logic
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Game state
        this.gameState = {
            score: 0,
            level: 1,
            timeLeft: CONFIG.BASE_TIME,
            isGameOver: false,
            isPaused: false
        };
        
        // Game objects
        this.player = null;
        this.mainSTX = null;
        this.miniSTXs = [];
        this.walls = null;
        
        // Maze data
        this.maze = null;
        this.collisionGrid = null;
        
        // Input
        this.cursors = null;
        this.wasd = null;
        
        // Timer
        this.gameTimer = null;
    }

    create() {
        console.log('GameScene: Starting game');
        
        // Ensure canvas has keyboard focus
        this.game.canvas.setAttribute('tabindex', '1');
        this.game.canvas.focus();
        
        // Calculate maze offset to center it properly
        const mazePixelWidth = CONFIG.MAZE_WIDTH * CONFIG.CELL_SIZE;
        const mazePixelHeight = CONFIG.MAZE_HEIGHT * CONFIG.CELL_SIZE;
        
        // Account for UI space at the top (80px padding-top from CSS)
        const uiSpaceTop = 80;
        const availableHeight = CONFIG.CANVAS_HEIGHT - uiSpaceTop;
        
        this.mazeOffsetX = (CONFIG.CANVAS_WIDTH - mazePixelWidth) / 2;
        this.mazeOffsetY = uiSpaceTop + (availableHeight - mazePixelHeight) / 2;
        
        console.log('Maze positioning debug:');
        console.log('- Canvas size:', CONFIG.CANVAS_WIDTH, 'x', CONFIG.CANVAS_HEIGHT);
        console.log('- Maze pixel size:', mazePixelWidth, 'x', mazePixelHeight);
        console.log('- UI space top:', uiSpaceTop);
        console.log('- Available height:', availableHeight);
        console.log('- Maze offset:', this.mazeOffsetX, ',', this.mazeOffsetY);
        
        // Initialize input
        this.setupInput();
        
        // Generate first maze
        this.generateNewLevel();
        
        // Start game timer
        this.startTimer();
        
        // Update UI
        this.updateUI();
        
        // Setup pause functionality
        this.setupPause();
    }

    setupInput() {
        // Arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // WASD keys
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // Mobile touch controls
        this.setupMobileControls();
        
        // Pause key - use global keyboard event to work even when scene is paused
        window.addEventListener('keydown', (event) => {
            if (event.key === 'p' || event.key === 'P') {
                this.togglePause();
            }
        });
    }

    setupMobileControls() {
        // Touch/swipe gesture detection
        let startX, startY, startTime;
        const minSwipeDistance = 50;
        const maxTapTime = 200; // milliseconds
        
        this.input.on('pointerdown', (pointer) => {
            startX = pointer.x;
            startY = pointer.y;
            startTime = this.time.now;
        });
        
        this.input.on('pointerup', (pointer) => {
            if (!startX || !startY) return;
            
            const deltaX = pointer.x - startX;
            const deltaY = pointer.y - startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const timeDiff = this.time.now - startTime;
            
            // Check for tap (short touch without movement)
            if (distance < 20 && timeDiff < maxTapTime) {
                this.togglePause();
                return;
            }
            
            // Only handle swipes on touch devices or when distance is significant
            if (distance < minSwipeDistance) {
                // Reset variables for short movements (like mouse clicks)
                startX = startY = startTime = null;
                return;
            }
            
            // Determine swipe direction
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    this.movePlayer('right');
                } else {
                    this.movePlayer('left');
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    this.movePlayer('down');
                } else {
                    this.movePlayer('up');
                }
            }
            
            startX = startY = startTime = null;
        });
    }

    movePlayer(direction) {
        if (!this.player || this.gameState.isGameOver || this.gameState.isPaused) return;
        
        const moveDistance = CONFIG.CELL_SIZE; // Move one cell at a time on mobile
        let deltaX = 0, deltaY = 0;
        
        switch(direction) {
            case 'up': deltaY = -moveDistance; break;
            case 'down': deltaY = moveDistance; break;
            case 'left': deltaX = -moveDistance; break;
            case 'right': deltaX = moveDistance; break;
        }
        
        // Same collision logic as keyboard movement
        const mazeRelativeX = this.player.x - this.mazeOffsetX;
        const mazeRelativeY = this.player.y - this.mazeOffsetY;
        
        const newPosition = CollisionSystem.getValidMovePosition(
            mazeRelativeX, mazeRelativeY,
            deltaX, deltaY,
            CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE,
            this.collisionGrid, CONFIG.CELL_SIZE,
            this.maze.grid  // Pass the maze grid for wall checking
        );
        
        // Smooth animation to new position
        this.tweens.add({
            targets: this.player,
            x: newPosition.x + this.mazeOffsetX,
            y: newPosition.y + this.mazeOffsetY,
            duration: 150,
            ease: 'Power2'
        });
    }

    generateNewLevel() {
        console.log(`Generating level ${this.gameState.level}`);
        
        // Clear existing objects
        this.clearLevel();
        
        // Generate maze
        this.maze = new MazeGenerator(CONFIG.MAZE_WIDTH, CONFIG.MAZE_HEIGHT);
        this.maze.generate();
        this.collisionGrid = this.maze.toCollisionGrid();
        
        // Debug: Log collision grid info
        console.log('Collision grid dimensions:', this.collisionGrid.length, 'x', this.collisionGrid[0].length);
        console.log('Visual maze dimensions:', CONFIG.MAZE_WIDTH, 'x', CONFIG.MAZE_HEIGHT);
        
        // Create visual representation
        this.createMazeVisuals();
        
        // Place player at start
        this.createPlayer();
        
        // Place main STX token
        this.createMainSTX();
        
        // Place mini STX tokens
        this.createMiniSTXs();
        
        // Update timer for level
        this.updateLevelTimer();
    }

    clearLevel() {
        // Remove existing game objects
        if (this.mazeGraphics) {
            this.mazeGraphics.destroy();
        }
        if (this.player) {
            this.player.destroy();
        }
        if (this.mainSTX) {
            this.mainSTX.destroy();
        }
        this.miniSTXs.forEach(miniSTX => miniSTX.destroy());
        this.miniSTXs = [];
    }

    createMazeVisuals() {
        // Create graphics object for drawing lines
        this.mazeGraphics = this.add.graphics();
        this.mazeGraphics.setDepth(1);
        
        // Set line style - neon blue with glow effect
        this.mazeGraphics.lineStyle(2, CONFIG.COLORS.WALL, 1.0);
        
        // Draw maze walls as lines instead of filled cells
        for (let y = 0; y < this.maze.height; y++) {
            for (let x = 0; x < this.maze.width; x++) {
                const cell = this.maze.grid[y][x];
                const worldX = x * CONFIG.CELL_SIZE + this.mazeOffsetX;
                const worldY = y * CONFIG.CELL_SIZE + this.mazeOffsetY;
                
                // Draw walls as lines around each cell
                if (cell.walls.top) {
                    this.mazeGraphics.moveTo(worldX, worldY);
                    this.mazeGraphics.lineTo(worldX + CONFIG.CELL_SIZE, worldY);
                }
                
                if (cell.walls.right) {
                    this.mazeGraphics.moveTo(worldX + CONFIG.CELL_SIZE, worldY);
                    this.mazeGraphics.lineTo(worldX + CONFIG.CELL_SIZE, worldY + CONFIG.CELL_SIZE);
                }
                
                if (cell.walls.bottom) {
                    this.mazeGraphics.moveTo(worldX + CONFIG.CELL_SIZE, worldY + CONFIG.CELL_SIZE);
                    this.mazeGraphics.lineTo(worldX, worldY + CONFIG.CELL_SIZE);
                }
                
                if (cell.walls.left) {
                    this.mazeGraphics.moveTo(worldX, worldY + CONFIG.CELL_SIZE);
                    this.mazeGraphics.lineTo(worldX, worldY);
                }
            }
        }
        
        // Stroke all the lines at once
        this.mazeGraphics.strokePath();
        
        // Add neon glow effect to the entire maze
        this.tweens.add({
            targets: this.mazeGraphics,
            alpha: { from: 0.7, to: 1.0 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    hasAdjacentWall(x, y) {
        // Check if there's a wall adjacent to this position
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1] // left, right, up, down
        ];
        
        for (let [dx, dy] of directions) {
            const checkX = x + dx;
            const checkY = y + dy;
            
            if (checkX >= 0 && checkX < this.collisionGrid[0].length &&
                checkY >= 0 && checkY < this.collisionGrid.length &&
                this.collisionGrid[checkY][checkX] === 1) {
                return true;
            }
        }
        return false;
    }

    createPlayer() {
        // Find a valid starting position (preferably top-left area)
        let startPos;
        let attempts = 0;
        
        // Try to find a position in the top-left quadrant first
        do {
            startPos = this.maze.getRandomEmptyPosition(this.collisionGrid);
            attempts++;
        } while (attempts < 10 && (startPos.x > this.collisionGrid[0].length / 2 || startPos.y > this.collisionGrid.length / 2));
        
        // If we couldn't find a good starting position, use any valid position
        if (attempts >= 10) {
            startPos = this.maze.getRandomEmptyPosition(this.collisionGrid);
        }
        
        const worldPos = CollisionSystem.getWorldPosition(startPos.x, startPos.y, CONFIG.CELL_SIZE);
        
        // Apply maze offset for centering
        const centeredX = worldPos.x + this.mazeOffsetX;
        const centeredY = worldPos.y + this.mazeOffsetY;
        
        this.player = this.add.image(centeredX, centeredY, 'player');
        this.player.setDisplaySize(CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE);
        this.player.setDepth(10); // Ensure player is above maze tiles
        
        // Add subtle glow effect to the mouse
        this.tweens.add({
            targets: this.player,
            alpha: { from: 0.9, to: 1.0 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        console.log('Player created at:', centeredX, centeredY);
        console.log('Maze offset:', this.mazeOffsetX, this.mazeOffsetY);
        console.log('Player visible?', this.player.visible);
        console.log('Player depth:', this.player.depth);
    }

    createMainSTX() {
        // Place main STX token at a random empty position
        let attempts = 0;
        let position;
        
        do {
            position = this.maze.getRandomEmptyPosition(this.collisionGrid);
            attempts++;
        } while (attempts < 50 && this.isPositionTooCloseToPlayer(position));
        
        const worldPos = CollisionSystem.getWorldPosition(position.x, position.y, CONFIG.CELL_SIZE);
        
        // Apply maze offset for centering
        const centeredX = worldPos.x + this.mazeOffsetX;
        const centeredY = worldPos.y + this.mazeOffsetY;
        
        console.log('Main STX placement debug:');
        console.log('- Grid position:', position);
        console.log('- World position (before offset):', worldPos);
        console.log('- Final position (with offset):', centeredX, centeredY);
        console.log('- Collision grid dimensions:', this.collisionGrid.length, 'x', this.collisionGrid[0].length);
        
        this.mainSTX = this.add.image(centeredX, centeredY, 'main-stx');
        this.mainSTX.setDisplaySize(24, 24); // Match sprite size
        this.mainSTX.setDepth(5); // Above maze, below player
        
        // Add pulsing animation
        this.tweens.add({
            targets: this.mainSTX,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createMiniSTXs() {
        const numMiniSTXs = Math.max(1, 4 - this.gameState.level);
        
        for (let i = 0; i < numMiniSTXs; i++) {
            let attempts = 0;
            let position;
            
            do {
                position = this.maze.getRandomEmptyPosition(this.collisionGrid);
                attempts++;
            } while (attempts < 20 && (
                this.isPositionTooCloseToPlayer(position) ||
                this.isPositionTooCloseToMainSTX(position) ||
                this.isPositionTooCloseToOtherMiniSTXs(position)
            ));
            
            const worldPos = CollisionSystem.getWorldPosition(position.x, position.y, CONFIG.CELL_SIZE);
            
            // Apply maze offset for centering
            const centeredX = worldPos.x + this.mazeOffsetX;
            const centeredY = worldPos.y + this.mazeOffsetY;
            
            console.log(`Mini STX ${i} placement debug:`, position, '->', centeredX, centeredY);
            
            const miniSTX = this.add.image(centeredX, centeredY, 'mini-stx');
            miniSTX.setDisplaySize(18, 18); // Match sprite size
            miniSTX.setDepth(5); // Above maze, below player
            
            // Add floating animation
            this.tweens.add({
                targets: miniSTX,
                y: centeredY - 5,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.miniSTXs.push(miniSTX);
        }
    }

    isPositionTooCloseToPlayer(position) {
        if (!this.player) return false;
        
        // Convert world position to maze-relative position
        const playerMazeX = this.player.x - this.mazeOffsetX;
        const playerMazeY = this.player.y - this.mazeOffsetY;
        const playerGrid = CollisionSystem.getGridPosition(playerMazeX, playerMazeY, CONFIG.CELL_SIZE);
        const distance = Math.abs(position.x - playerGrid.x) + Math.abs(position.y - playerGrid.y);
        
        return distance < 5; // Manhattan distance
    }

    isPositionTooCloseToMainSTX(position) {
        if (!this.mainSTX) return false;
        
        // Convert world position to maze-relative position
        const stxMazeX = this.mainSTX.x - this.mazeOffsetX;
        const stxMazeY = this.mainSTX.y - this.mazeOffsetY;
        const stxGrid = CollisionSystem.getGridPosition(stxMazeX, stxMazeY, CONFIG.CELL_SIZE);
        const distance = Math.abs(position.x - stxGrid.x) + Math.abs(position.y - stxGrid.y);
        
        return distance < 3;
    }

    isPositionTooCloseToOtherMiniSTXs(position) {
        return this.miniSTXs.some(miniSTX => {
            // Convert world position to maze-relative position
            const miniMazeX = miniSTX.x - this.mazeOffsetX;
            const miniMazeY = miniSTX.y - this.mazeOffsetY;
            const miniGrid = CollisionSystem.getGridPosition(miniMazeX, miniMazeY, CONFIG.CELL_SIZE);
            const distance = Math.abs(position.x - miniGrid.x) + Math.abs(position.y - miniGrid.y);
            return distance < 3;
        });
    }

    update() {
        if (this.gameState.isGameOver || this.gameState.isPaused) {
            return;
        }
        
        this.handleInput();
        this.checkCollisions();
        this.updateUI();
    }

    handleInput() {
        if (!this.player) return;
        
        let deltaX = 0;
        let deltaY = 0;
        
        // Check input - use delta time for smooth movement
        const speed = CONFIG.PLAYER_SPEED / 60; // pixels per frame at 60fps
        
        // Check input
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            deltaX = -speed;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            deltaX = speed;
        }
        
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            deltaY = -speed;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            deltaY = speed;
        }
        
        // Move player with collision detection
        if (deltaX !== 0 || deltaY !== 0) {
            // Convert world position to maze-relative position for collision detection
            const mazeRelativeX = this.player.x - this.mazeOffsetX;
            const mazeRelativeY = this.player.y - this.mazeOffsetY;
            
            const newPosition = CollisionSystem.getValidMovePosition(
                mazeRelativeX, mazeRelativeY,
                deltaX, deltaY,
                CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE,
                this.collisionGrid, CONFIG.CELL_SIZE,
                this.maze.grid  // Pass the maze grid for wall checking
            );
            
            // Convert back to world coordinates
            const worldX = newPosition.x + this.mazeOffsetX;
            const worldY = newPosition.y + this.mazeOffsetY;
            
            this.player.setPosition(worldX, worldY);
        }
    }

    checkCollisions() {
        if (!this.player) return;
        
        // Check main STX collision
        if (this.mainSTX && CollisionSystem.checkPointCollision(
            this.player.x, this.player.y,
            this.mainSTX.x, this.mainSTX.y, 25
        )) {
            this.collectMainSTX();
        }
        
        // Check mini STX collisions
        this.miniSTXs.forEach((miniSTX, index) => {
            if (CollisionSystem.checkPointCollision(
                this.player.x, this.player.y,
                miniSTX.x, miniSTX.y, 20
            )) {
                this.collectMiniSTX(index);
            }
        });
    }

    collectMainSTX() {
        console.log('Main STX collected!');
        
        // Add score
        const levelBonus = CONFIG.MAIN_STX_POINTS * this.gameState.level;
        const timeBonus = Math.floor(this.gameState.timeLeft * CONFIG.TIME_BONUS_MULTIPLIER);
        this.gameState.score += levelBonus + timeBonus;
        
        // Remove main STX
        this.mainSTX.destroy();
        this.mainSTX = null;
        
        // Level up
        this.gameState.level++;
        
        // Generate new level
        this.time.delayedCall(500, () => {
            this.generateNewLevel();
        });
    }

    collectMiniSTX(index) {
        console.log('Mini STX collected!');
        
        // Add score and time
        this.gameState.score += CONFIG.MINI_STX_POINTS;
        this.gameState.timeLeft += CONFIG.MINI_STX_TIME_BONUS;
        
        // Remove mini STX
        this.miniSTXs[index].destroy();
        this.miniSTXs.splice(index, 1);
    }

    startTimer() {
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    updateTimer() {
        if (this.gameState.isPaused) return;
        
        this.gameState.timeLeft--;
        
        if (this.gameState.timeLeft <= 0) {
            this.gameOver();
        }
    }

    updateLevelTimer() {
        const newTime = Math.max(
            CONFIG.MIN_TIME,
            CONFIG.BASE_TIME - (this.gameState.level - 1) * CONFIG.TIME_DECREASE_PER_LEVEL
        );
        this.gameState.timeLeft = newTime;
    }

    updateUI() {
        // Update DOM elements
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        const timerElement = document.getElementById('timer');
        
        if (scoreElement) scoreElement.textContent = this.gameState.score;
        if (levelElement) levelElement.textContent = this.gameState.level;
        if (timerElement) {
            timerElement.textContent = this.gameState.timeLeft;
            // Change color when time is low
            if (this.gameState.timeLeft <= 5) {
                timerElement.style.color = '#ff4444';
            } else {
                timerElement.style.color = '#00ff88';
            }
        }
    }

    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        
        if (this.gameState.isPaused) {
            this.scene.pause();
            this.showPauseOverlay();
        } else {
            this.scene.resume();
            this.hidePauseOverlay();
        }
    }

    showPauseOverlay() {
        // Create or show pause overlay
        let pauseOverlay = document.getElementById('pause-overlay');
        if (!pauseOverlay) {
            pauseOverlay = document.createElement('div');
            pauseOverlay.id = 'pause-overlay';
            pauseOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 200;
                cursor: pointer;
            `;
            pauseOverlay.innerHTML = `
                <div style="font-size: 48px; color: #00CCFF; margin-bottom: 20px; text-shadow: 0 0 20px #00CCFF;">PAUSED</div>
                <div style="font-size: 18px; color: #888;">Press P to Resume</div>
                <div style="font-size: 14px; color: #666; margin-top: 10px;">or click anywhere</div>
            `;
            
            // Allow clicking to unpause
            pauseOverlay.addEventListener('click', () => {
                if (this.gameState.isPaused) {
                    this.togglePause();
                }
            });
            
            document.getElementById('game-container').appendChild(pauseOverlay);
        } else {
            pauseOverlay.style.display = 'flex';
        }
    }

    hidePauseOverlay() {
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            pauseOverlay.style.display = 'none';
        }
    }

    setupPause() {
        // Handle window focus/blur for auto-pause
        window.addEventListener('blur', () => {
            if (!this.gameState.isGameOver) {
                this.gameState.isPaused = true;
                this.scene.pause();
            }
        });
        
        window.addEventListener('focus', () => {
            // Don't auto-resume, let player manually resume
        });
    }

    gameOver() {
        console.log('Game Over! Final Score:', this.gameState.score);
        
        this.gameState.isGameOver = true;
        
        // Stop timer
        if (this.gameTimer) {
            this.gameTimer.destroy();
        }
        
        // Show game over screen
        this.showGameOverScreen();
        
        // Submit score to blockchain
        this.submitScore();
    }

    showGameOverScreen() {
        const gameOverScreen = document.getElementById('game-over-screen');
        const finalScoreElement = document.getElementById('final-score');
        
        if (finalScoreElement) {
            finalScoreElement.textContent = this.gameState.score;
        }
        
        if (gameOverScreen) {
            gameOverScreen.style.display = 'flex';
        }
        
        // Setup restart button
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            restartButton.onclick = () => this.restartGame();
        }
    }

    async submitScore() {
        const submissionStatus = document.getElementById('submission-status');
        
        if (!window.stacksAPI.isWalletConnected) {
            if (submissionStatus) {
                submissionStatus.textContent = 'Connect wallet to submit scores to leaderboard';
            }
            return;
        }
        
        try {
            await window.contractCalls.submitScoreWithFeedback(
                this.gameState.score,
                this.gameState.level,
                (status) => {
                    if (submissionStatus) {
                        submissionStatus.textContent = status;
                    }
                }
            );
        } catch (error) {
            console.error('Error submitting score:', error);
            if (submissionStatus) {
                submissionStatus.textContent = 'Error submitting score';
            }
        }
    }

    restartGame() {
        // Hide game over screen
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.style.display = 'none';
        }
        
        // Reset game state
        this.gameState = {
            score: 0,
            level: 1,
            timeLeft: CONFIG.BASE_TIME,
            isGameOver: false,
            isPaused: false
        };
        
        // Restart the scene
        this.scene.restart();
    }
}
