// Boot Scene - Handles asset loading and initialization
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
        this.loadingProgress = 0;
    }

    preload() {
        // Update loading progress
        this.load.on('progress', (progress) => {
            this.loadingProgress = progress;
            this.updateLoadingBar(progress);
        });

        this.load.on('complete', () => {
            this.updateLoadingBar(1);
            // Small delay before starting the game
            this.time.delayedCall(500, () => {
                this.scene.start('GameScene');
                this.hideLoadingScreen();
            });
        });

        // Create simple colored rectangles as placeholders for sprites
        this.createColorTextures();
        
        // Load any actual assets here if available
        // this.load.image('player', 'assets/player.png');
        // this.load.image('stx-token', 'assets/stx-token.png');
        // this.load.audio('collect', 'assets/sounds/collect.wav');
    }

    create() {
        // Initialize wallet connection
        if (window.stacksAPI) {
            window.stacksAPI.initialize();
        }

        console.log('BootScene: Assets loaded successfully');
    }

    createColorTextures() {
        // Create colored rectangle textures for game objects
        const graphics = this.add.graphics();

        // Player texture (green circle)
        graphics.fillStyle(CONFIG.COLORS.PLAYER);
        graphics.fillCircle(12, 12, 12);
        graphics.generateTexture('player', 24, 24);
        graphics.clear();

        // Main STX token texture (orange hexagon)
        graphics.fillStyle(CONFIG.COLORS.MAIN_STX);
        graphics.fillCircle(16, 16, 16);
        graphics.lineStyle(3, 0xffffff);
        graphics.strokeCircle(16, 16, 16);
        graphics.generateTexture('main-stx', 32, 32);
        graphics.clear();

        // Mini STX token texture (blue circle)
        graphics.fillStyle(CONFIG.COLORS.MINI_STX);
        graphics.fillCircle(10, 10, 10);
        graphics.lineStyle(2, 0xffffff);
        graphics.strokeCircle(10, 10, 10);
        graphics.generateTexture('mini-stx', 20, 20);
        graphics.clear();

        // Wall texture
        graphics.fillStyle(CONFIG.COLORS.WALL);
        graphics.fillRect(0, 0, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
        graphics.lineStyle(1, 0x555555);
        graphics.strokeRect(0, 0, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
        graphics.generateTexture('wall', CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
        graphics.clear();

        // Path texture
        graphics.fillStyle(CONFIG.COLORS.PATH);
        graphics.fillRect(0, 0, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
        graphics.generateTexture('path', CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
        graphics.clear();

        // Destroy the graphics object
        graphics.destroy();
    }

    updateLoadingBar(progress) {
        const loadingBar = document.getElementById('loading-progress');
        if (loadingBar) {
            loadingBar.style.width = `${progress * 100}%`;
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }
}
