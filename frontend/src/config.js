// Game configuration constants
const CONFIG = {
    // Game dimensions
    CANVAS_WIDTH: 500,
    CANVAS_HEIGHT: 200,
    
    // Maze settings
    MAZE_WIDTH: 25,
    MAZE_HEIGHT: 19,
    CELL_SIZE: 32,
    
    // Player settings
    PLAYER_SIZE: 24,
    PLAYER_SPEED: 150,
    
    // Game mechanics
    BASE_TIME: 30, // seconds
    TIME_DECREASE_PER_LEVEL: 2,
    MIN_TIME: 10,
    MINI_STX_TIME_BONUS: 3,
    
    // Scoring
    MAIN_STX_POINTS: 100,
    MINI_STX_POINTS: 10,
    TIME_BONUS_MULTIPLIER: 1,
    
    // Colors
    COLORS: {
        BACKGROUND: 0x0f0f0f,
        WALL: 0x333333,
        PATH: 0x111111,
        PLAYER: 0x00ff88,
        MAIN_STX: 0xffaa00,
        MINI_STX: 0x00ccff,
        UI_PRIMARY: 0x00ff88,
        UI_SECONDARY: 0x00ccff
    },
    
    // Blockchain settings
    NETWORK: 'testnet', // 'mainnet' or 'testnet'
    CONTRACT_ADDRESS: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Placeholder
    CONTRACT_NAME: 'stackrunner',
    
    // Game balance
    DIFFICULTY_SCALING: {
        MAZE_COMPLEXITY_INCREASE: 0.2,
        DEAD_END_RATIO_INCREASE: 0.1,
        MINI_STX_DECREASE: 1
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
