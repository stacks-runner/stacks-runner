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
        
        // Pause key
        this.input.keyboard.on('keydown-P', () => {
            this.togglePause();
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
        if (this.walls) {
            this.walls.clear(true, true);
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
        // Create walls group
        this.walls = this.add.group();
        
        // Draw maze walls
        for (let y = 0; y < this.collisionGrid.length; y++) {
            for (let x = 0; x < this.collisionGrid[y].length; x++) {
                const worldX = x * CONFIG.CELL_SIZE;
                const worldY = y * CONFIG.CELL_SIZE;
                
                if (this.collisionGrid[y][x] === 1) {
                    // Wall
                    const wall = this.add.image(worldX, worldY, 'wall');
                    wall.setOrigin(0, 0);
                    this.walls.add(wall);
                } else {
                    // Path
                    const path = this.add.image(worldX, worldY, 'path');
                    path.setOrigin(0, 0);
                }
            }
        }
    }

    createPlayer() {
        // Find a valid starting position (usually top-left area)
        const startPos = this.maze.getRandomEmptyPosition(this.collisionGrid);
        const worldPos = CollisionSystem.getWorldPosition(startPos.x, startPos.y, CONFIG.CELL_SIZE);
        
        this.player = this.add.image(worldPos.x, worldPos.y, 'player');
        this.player.setDisplaySize(CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE);
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
        
        this.mainSTX = this.add.image(worldPos.x, worldPos.y, 'main-stx');
        this.mainSTX.setDisplaySize(28, 28);
        
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
            
            const miniSTX = this.add.image(worldPos.x, worldPos.y, 'mini-stx');
            miniSTX.setDisplaySize(16, 16);
            
            // Add floating animation
            this.tweens.add({
                targets: miniSTX,
                y: worldPos.y - 5,
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
        
        const playerGrid = CollisionSystem.getGridPosition(this.player.x, this.player.y, CONFIG.CELL_SIZE);
        const distance = Math.abs(position.x - playerGrid.x) + Math.abs(position.y - playerGrid.y);
        
        return distance < 5; // Manhattan distance
    }

    isPositionTooCloseToMainSTX(position) {
        if (!this.mainSTX) return false;
        
        const stxGrid = CollisionSystem.getGridPosition(this.mainSTX.x, this.mainSTX.y, CONFIG.CELL_SIZE);
        const distance = Math.abs(position.x - stxGrid.x) + Math.abs(position.y - stxGrid.y);
        
        return distance < 3;
    }

    isPositionTooCloseToOtherMiniSTXs(position) {
        return this.miniSTXs.some(miniSTX => {
            const miniGrid = CollisionSystem.getGridPosition(miniSTX.x, miniSTX.y, CONFIG.CELL_SIZE);
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
        
        // Check input
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            deltaX = -CONFIG.PLAYER_SPEED * (1/60); // Assuming 60 FPS
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            deltaX = CONFIG.PLAYER_SPEED * (1/60);
        }
        
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            deltaY = -CONFIG.PLAYER_SPEED * (1/60);
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            deltaY = CONFIG.PLAYER_SPEED * (1/60);
        }
        
        // Move player with collision detection
        if (deltaX !== 0 || deltaY !== 0) {
            const newPosition = CollisionSystem.getValidMovePosition(
                this.player.x, this.player.y,
                deltaX, deltaY,
                CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE,
                this.collisionGrid, CONFIG.CELL_SIZE
            );
            
            this.player.setPosition(newPosition.x, newPosition.y);
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
        } else {
            this.scene.resume();
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
