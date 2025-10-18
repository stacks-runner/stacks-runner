<!-- filepath: DEVELOPER_QUICK_START.md -->

# 🚀 Developer Quick Start - Real Blockchain Integration

## In 2 Minutes

### What Changed?
✅ **StackRunner now talks to the real blockchain!**

1. **stacksAPI.js** - Connects to real Stacks wallets (Leather, Hiro, Xverse)
2. **contractAPI.js** - Calls MazeGame.clar contract functions
3. **ConnectWalletScene.js** - Tries real connection, falls back to demo

### Try It Now

#### Option 1: Demo Mode (No Wallet Needed)
```javascript
// In browser console:
localStorage.setItem('DEMO_MODE', 'true');
location.reload();
// Click "Connect Wallet" → Auto-connects with fake address
// Create & play game → All instant, no blockchain
```

#### Option 2: Testnet (Real Blockchain)
1. Install Leather: https://leather.io
2. Create testnet account
3. Request STX from faucet
4. In browser console:
```javascript
localStorage.setItem('DEMO_MODE', 'false');
location.reload();
```
5. Click "Connect Wallet" → Approve in Leather
6. Create maze → Leather will ask to sign
7. Play game & claim reward → Leather will ask to sign again

---

## 📚 API Reference

### StacksAPI (Wallet Connection)
```javascript
// Check if connected
window.stacksAPI.isWalletConnected  // true/false
window.stacksAPI.userAddress        // "SP1234..."

// Connect wallet
await window.stacksAPI.connectWallet()
// Returns: { success: true, address: "SP1234..." }

// Disconnect
await window.stacksAPI.disconnectWallet()

// Get balance (live mode only)
const balance = await window.stacksAPI.getAccountBalance()
// Returns: "100000000" microSTX

// Call contract function (internal use)
const result = await window.stacksAPI.callContractFunction(
  'create-game',
  [uintCV(5), uintCV(100000)]
)
// Returns: { success: true, txId: "0x1234..." }
```

### ContractAPI (Game Logic)
```javascript
// Create new game
const result = await window.contractAPI.createGame(
  5,        // rounds
  100000    // bounty in microSTX
)
// Returns: { success: true, gameId: 789123, txId: "0x1234..." }

// Submit round completion (final round checks for winners)
const result = await window.contractAPI.updatePlayerProgress(
  789123,    // gameId
  5,         // currentRound
  45230      // completionTime in ms
)
// Returns: { 
//   success: true, 
//   isWinner: true, 
//   position: 2,        // 1-5
//   reward: 25000       // microSTX
// }

// Claim reward (only if winner)
const result = await window.contractAPI.claimReward(
  789123,  // gameId
  2        // position (1-5)
)
// Returns: { 
//   success: true, 
//   rewardAmount: 25000,
//   txId: "0x5678..."
// }

// Get game data
const game = window.contractAPI.getGameData(789123)
// { gameId, totalRounds, bounty, playerAddress, ... }

// Get winner at position
const winner = window.contractAPI.getWinner(789123, 1)
// { player, position, reward, claimed, txId, ... }

// Format time
window.contractAPI.formatTime(45230)  // "45.230s"

// Calculate reward
window.contractAPI.calculateReward(100000, 0.40)  // 40000
```

---

## 🔧 Configuration

### File: `frontend/public/src/config.js`

```javascript
// Current settings:
CONFIG.NETWORK = 'testnet'
CONFIG.CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
CONFIG.CONTRACT_NAME = 'stackrunner'

// Change to mainnet:
CONFIG.NETWORK = 'mainnet'

// Update after deploying contract:
CONFIG.CONTRACT_ADDRESS = 'YOUR_DEPLOYED_ADDRESS_HERE'
```

---

## 🎮 How It Works in Game

### Flow
```
1. Connect Wallet Scene
   ├─ Try real wallet (stacksAPI.connectWallet)
   ├─ If fails: Try demo (simulateWalletConnection)
   └─ Set contractAPI.useDemo accordingly

2. Maze Creation Scene
   └─ Call contractAPI.createGame(5, 100000)
      ├─ Live: Submit to blockchain via stacksAPI
      └─ Demo: Store in localStorage

3. Game Scene
   └─ Player completes all levels
      └─ Call contractAPI.updatePlayerProgress(gameId, 5, time)
         ├─ Live: Submit final round to blockchain
         ├─ Check if top 5 fastest
         └─ Store winner info if yes

4. Game Over Scene
   ├─ If winner: Show reward button
   └─ Click button → contractAPI.claimReward(gameId, position)
      ├─ Live: Claim reward from blockchain
      └─ Demo: Mark as claimed in localStorage
```

---

## 🐛 Debugging

### Check Connection Status
```javascript
console.log('Connected:', window.stacksAPI.isWalletConnected)
console.log('Address:', window.stacksAPI.userAddress)
console.log('Mode:', window.contractAPI.useDemo ? 'DEMO' : 'LIVE')
```

### Check Game State
```javascript
// Current game ID
const gameId = localStorage.getItem('currentGameId')

// Game data
console.log(window.contractAPI.getGameData(gameId))

// All winners
console.log(window.contractAPI.getAllWinners(gameId))

// All completions (demo mode)
console.log(JSON.parse(localStorage.getItem(`completions_${gameId}`)))
```

### Test Contract Call
```javascript
// In demo mode
window.contractAPI.useDemo = true

// Test game creation
const result = await window.contractAPI.createGame(5, 100000)
console.log(result)

// Simulate game completion
await window.contractAPI.updatePlayerProgress(
  result.gameId,
  5,
  45000
)
```

### Enable Debug Logging
All function calls are already logged:
- 🔗 Blockchain actions
- 📤 Transaction submissions
- ⏳ Transaction confirmations
- ✅ Successes
- ❌ Errors

Open browser console (F12) and look for these prefixes.

---

## 🚀 Deployment Steps

### Step 1: Deploy Contract
```bash
# Deploy MazeGame.clar to testnet
clarinet deploy --testnet

# Note the deployed contract address
# Example: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.stackrunner
```

### Step 2: Update Config
```javascript
// frontend/public/src/config.js
CONFIG.CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
CONFIG.NETWORK = 'testnet'
```

### Step 3: Build Frontend
```bash
cd frontend
npm run build
```

### Step 4: Deploy Frontend
```bash
# Deploy to Vercel / Netlify / your host
npm run build
# Upload dist/ folder
```

### Step 5: Test Live Connection
1. Go to website
2. Click "Connect Wallet"
3. Approve in wallet
4. Create game
5. Play and complete game
6. Claim reward

---

## 📊 Mode Comparison

| Feature | Demo Mode | Live Mode |
|---------|-----------|-----------|
| Wallet Connection | Simulated | Real (Leather/Hiro/Xverse) |
| Game Creation | Instant | ~10 seconds (with wallet sign) |
| Progress Tracking | Instant | Real-time blockchain |
| Reward Claiming | Instant | ~10 seconds (with wallet sign) |
| STX Transfers | Simulated | Real on blockchain |
| localStorage Fallback | Native | No fallback needed |
| Network Required | No | Yes (testnet/mainnet) |
| Testing | ✅ Yes | ✅ Yes |

---

## ⚡ Pro Tips

### Enable Demo for Testing
```javascript
// In console
localStorage.setItem('DEMO_MODE', 'true')
location.reload()
```

### Toggle Mode at Runtime
```javascript
// Switch to demo
window.contractAPI.useDemo = true

// Switch to live
window.contractAPI.useDemo = false
```

### Clear Game Data
```javascript
// Reset localStorage
localStorage.clear()
location.reload()
```

### Manually Mark Winner
```javascript
const gameId = localStorage.getItem('currentGameId')
const key = `winner_${gameId}_1`
localStorage.setItem(key, JSON.stringify({
  gameId,
  position: 1,
  player: window.stacksAPI.userAddress,
  completionTime: 45000,
  reward: 40000,
  claimed: false
}))
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connect Wallet" button does nothing | Check browser console for errors, reload page |
| Wallet modal doesn't appear | Ensure Leather/Hiro is installed, reload page |
| "Wallet not connected" error | Click button again, approve in wallet extension |
| Contract calls failing | Check contract is deployed, verify address in config |
| No STX balance error | Request from testnet faucet or buy on exchange |
| Transaction timeout | Network slow, try again or check if pending |
| Demo mode not working | Set `localStorage.setItem('DEMO_MODE', 'true')` |

---

## 📖 Further Reading

- [REAL_BLOCKCHAIN_INTEGRATION_FINAL.md](./REAL_BLOCKCHAIN_INTEGRATION_FINAL.md) - Complete implementation details
- [SMART_CONTRACT_INTEGRATION_GUIDE.md](./SMART_CONTRACT_INTEGRATION_GUIDE.md) - Contract API reference
- [Stacks.js Documentation](https://docs.stacks.co/build-apps/overview) - Official Stacks docs
- [Clarity Language Guide](https://docs.stacks.co/write-smart-contracts/overview) - Clarity contract reference

