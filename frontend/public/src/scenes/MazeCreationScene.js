// Maze Creation Scene - User configuration before gameplay
class MazeCreationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MazeCreationScene' });
        this.userMazeConfig = null;
    }

    create() {
        // UI overlay is hidden by default, no need to hide it here
        
        // Create the maze creation UI overlay
        this.createMazeCreationUI();
    }

    createMazeCreationUI() {
        // Create flex container matching ConnectWalletScene design
        let mazeCreationContainer = document.getElementById('maze-creation-container');
        if (!mazeCreationContainer) {
            mazeCreationContainer = document.createElement('div');
            mazeCreationContainer.id = 'maze-creation-container';
            mazeCreationContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000000;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                z-index: 400;
                font-family: Arial, sans-serif;
                padding: 60px 20px;
                box-sizing: border-box;
            `;
            
            // Create title at top
            const titleElement = document.createElement('h1');
            titleElement.textContent = 'StacksRunner';
            titleElement.style.cssText = `
                color: #FFFFFF;
                font-size: 48px;
                font-weight: bold;
                margin: 0;
                text-align: center;
            `;
            
            // Create center section with button
            const centerSection = document.createElement('div');
            centerSection.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
            `;
            
            // Create maze button
            const createButton = document.createElement('button');
            createButton.id = 'create-maze-button';
            createButton.textContent = 'Create Maze';
            createButton.style.cssText = `
                background: linear-gradient(135deg, #8B5CF6, #A855F7);
                color: #FFFFFF;
                border: none;
                padding: 16px 40px;
                font-size: 18px;
                font-weight: 600;
                border-radius: 12px;
                cursor: pointer;
                box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
                transition: all 0.3s ease;
                font-family: Arial, sans-serif;
                min-width: 200px;
            `;
            
            // Add status text
            const statusDiv = document.createElement('div');
            statusDiv.id = 'creation-status';
            statusDiv.style.cssText = `
                font-size: 14px;
                color: #888;
                text-align: center;
                opacity: 0;
                transition: all 0.3s ease;
            `;
            
            // Add hover effects to button
            createButton.addEventListener('mouseenter', () => {
                createButton.style.transform = 'translateY(-2px)';
                createButton.style.boxShadow = '0 12px 30px rgba(139, 92, 246, 0.4)';
            });
            
            createButton.addEventListener('mouseleave', () => {
                createButton.style.transform = 'translateY(0)';
                createButton.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)';
            });
            
            // Empty div for spacing
            const spacer = document.createElement('div');
            
            // Assemble the layout
            centerSection.appendChild(createButton);
            centerSection.appendChild(statusDiv);
            
            mazeCreationContainer.appendChild(titleElement);
            mazeCreationContainer.appendChild(centerSection);
            mazeCreationContainer.appendChild(spacer);

            document.getElementById('game-container').appendChild(mazeCreationContainer);
        }

        // Setup event handlers
        this.setupMazeCreationHandlers();
    }

    setupMazeCreationHandlers() {
        const createButton = document.getElementById('create-maze-button');

        // Create maze button handler
        createButton.addEventListener('click', () => {
            this.createMaze();
        });
    }



    async createMaze() {
        const statusDiv = document.getElementById('creation-status');
        const createButton = document.getElementById('create-maze-button');
        
        try {
            // Show status message
            statusDiv.textContent = 'Creating maze...';
            statusDiv.style.opacity = '1';
            createButton.disabled = true;
            createButton.style.opacity = '0.6';
            
            // Generate random game ID
            const gameId = this.generateRandomGameId();
            
            // Create simple maze configuration
            this.userMazeConfig = {
                gameId: gameId,
                difficulty: 'normal',
                createdAt: Date.now()
            };
            
            statusDiv.textContent = 'Maze created successfully! Starting game...';
            
            // Start the game with the maze configuration
            setTimeout(() => {
                this.startGameWithMaze();
            }, 1000);
            
        } catch (error) {
            console.error('Error creating maze:', error);
            statusDiv.textContent = 'Error creating maze. Please try again.';
            statusDiv.style.opacity = '1';
            createButton.disabled = false;
            createButton.style.opacity = '1';
        }
    }

    generateUserIdFromAddress(address) {
        // Create a hash of the wallet address for user ID
        let hash = 0;
        for (let i = 0; i < address.length; i++) {
            const char = address.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return `user_${Math.abs(hash).toString(16)}`;
    }

    generateRandomGameId() {
        // Generate a random game ID
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        return `game_${timestamp}_${random}`;
    }

    async registerMazeWithBlockchain() {
        // Register user and maze with the blockchain
        // This is where we'll integrate with the smart contract
        
        console.log('Registering maze with blockchain:', {
            userId: this.userMazeConfig.userId,
            gameId: this.userMazeConfig.gameId,
            difficulty: this.userMazeConfig.difficulty,
            bountyAmount: this.userMazeConfig.bountyAmount
        });
        
        // TODO: Implement actual blockchain calls
        // await window.contractCalls.registerUser(this.userMazeConfig.userId);
        // await window.contractCalls.createMaze(this.userMazeConfig.gameId, this.userMazeConfig.userId, this.userMazeConfig.difficulty, this.userMazeConfig.bountyAmount);
    }

    startGameWithMaze() {
        // Hide the maze creation container
        const container = document.getElementById('maze-creation-container');
        if (container) {
            container.style.transition = 'all 0.5s ease';
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
        }
        
        // Start game after animation
        setTimeout(() => {
            if (container) {
                container.remove();
            }
            
            // Pass maze configuration to game scene and start it
            this.scene.start('GameScene', { 
                userMazeConfig: this.userMazeConfig 
            });
        }, 500);
    }
}