// Connect Wallet Scene
class ConnectWalletScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ConnectWalletScene' });
    }

    preload() {
        // Load the logo image (same as title scene)
        this.load.image('maze-logo', 'assets/images/maze-logo.png');
    }

    create() {
        // Set solid black background
        this.cameras.main.setBackgroundColor('#000000');
        
        // UI overlay is hidden by default, no need to hide it here
        
        // Calculate center positions
        const centerX = CONFIG.CANVAS_WIDTH / 2;
        const centerY = CONFIG.CANVAS_HEIGHT / 2;
        
        // Logo will be handled by flexbox container instead of Phaser
        
        // Create the connect wallet button
        this.createConnectWalletButton();
        
        // Add entrance animation
        this.addEntranceAnimation();
        
        // Setup responsive layout
        this.setupResponsiveLayout();
        
        // Check if wallet is already connected
        this.checkWalletConnection();

        // Setup responsive layout
        this.setupResponsiveLayout();
    }
    
    createConnectWalletButton() {
        // Create flex container
        let container = document.getElementById('connect-wallet-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'connect-wallet-container';
            container.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 50px;
                z-index: 100;
            `;
            
            // Create logo element for flex container
            const logoImg = document.createElement('img');
            logoImg.src = 'assets/images/maze-logo.png';
            logoImg.style.cssText = `
                width: 120px;
                height: auto;
                transform: rotate(120deg);
                opacity: 0.95;
            `;
            
            // Create button
            const button = document.createElement('button');
            button.id = 'connect-wallet-btn';
            button.textContent = 'Connect Wallet';
            button.style.cssText = `
                background: linear-gradient(135deg, #8B5CF6, #A855F7);
                color: #000;
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
            
            // Add hover effects
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 12px 30px rgba(139, 92, 246, 0.4)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)';
            });
            
            // Add click handler
            button.addEventListener('click', () => {
                this.connectWallet();
            });
            
            container.appendChild(logoImg);
            container.appendChild(logoImg);
            container.appendChild(button);
            document.getElementById('game-container').appendChild(container);
        }
    }
    
    addEntranceAnimation() {
        // Fade in the entire container
        const container = document.getElementById('connect-wallet-container');
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                container.style.transition = 'all 0.8s ease';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0px)';
            }, 200);
        }
    }
    
    checkWalletConnection() {
        // If wallet is already connected, skip to maze creation
        if (window.stacksAPI && window.stacksAPI.isWalletConnected) {
            setTimeout(() => {
                this.proceedToMazeCreation();
            }, 1000);
        }
    }
    
    async connectWallet() {
        const button = document.getElementById('connect-wallet-btn');
        const originalText = button.textContent;
        
        try {
            // Update button state
            button.textContent = 'Connecting...';
            button.disabled = true;
            button.style.opacity = '0.7';
            
            // Attempt to connect wallet (mock for now since blockchain is disabled)
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate connection delay
            
            // For now, simulate successful connection
            button.textContent = 'Connected!';
            button.style.background = 'linear-gradient(135deg, #10B981, #059669)';
            
            // Proceed to maze creation after brief delay
            setTimeout(() => {
                this.proceedToMazeCreation();
            }, 800);
            
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            button.textContent = 'Connection Failed';
            button.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
            
            // Reset button after delay
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = 'linear-gradient(135deg, #8B5CF6, #A855F7)';
                button.disabled = false;
                button.style.opacity = '1';
            }, 2000);
        }
    }
    
    proceedToMazeCreation() {
        // Fade out the entire container
        const container = document.getElementById('connect-wallet-container');
        if (container) {
            container.style.transition = 'all 0.5s ease';
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
        }
        
        // Transition to maze creation scene
        setTimeout(() => {
            // Clean up DOM elements
            if (container) {
                container.remove();
            }
            
            // Show UI overlay for next scene
            const uiOverlay = document.getElementById('ui-overlay');
            if (uiOverlay) {
                uiOverlay.style.display = 'flex';
            }
            
            // Start maze creation scene
            this.scene.start('MazeCreationScene');
        }, 500);
    }

    setupResponsiveLayout() {
        // Handle window resize events (same as TitleScene)
        window.addEventListener('resize', () => {
            // Update logo positioning
            const centerX = CONFIG.CANVAS_WIDTH / 2;
            const centerY = CONFIG.CANVAS_HEIGHT / 2;
            const isMobile = window.innerWidth <= 768;
            const isSmallMobile = window.innerWidth <= 480;
            
            const logoOffsetY = isSmallMobile ? -20 : isMobile ? -20 : -20;
            const logoScale = isSmallMobile ? 0.1 : isMobile ? 0.12 : 0.15;
            
            if (this.logo) {
                this.logo.setPosition(centerX, centerY + logoOffsetY);
                this.logo.setScale(logoScale);
            }
            
            // Update button positioning
            const button = document.getElementById('connect-wallet-btn');
            if (button) {
                const buttonFontSize = isSmallMobile ? '16px' : isMobile ? '17px' : '18px';
                const buttonPadding = isSmallMobile ? '14px 32px' : isMobile ? '15px 36px' : '16px 40px';
                const bottomSpacing = isSmallMobile ? '30px' : isMobile ? '35px' : '50px';
                const buttonMinWidth = isSmallMobile ? '160px' : isMobile ? '180px' : '200px';
                
                button.style.fontSize = buttonFontSize;
                button.style.padding = buttonPadding;
                button.style.bottom = bottomSpacing;
                button.style.minWidth = buttonMinWidth;
            }
        });
    }
}