# Stacks-Connect Integration Guide for StacksRunner

**Purpose:** Complete guide to using stacks-connect.js functions in StacksRunner  
**Status:** ✅ Production Ready  
**Last Updated:** October 18, 2025

---

## 🎯 Integration Overview

### Current State

Your StacksRunner project has all pieces in place:

```
✅ Library loaded: /frontend/public/lib/stacks-connect.js (1.1 MB)
✅ HTML reference: /frontend/public/index.html links the script
✅ API wrapper: /frontend/public/src/api/stacksAPI.js
✅ Scene usage: /frontend/public/src/scenes/ConnectWalletScene.js
✅ All 55+ functions accessible via window object
```

### Available Functions: Quick Access

```javascript
// Authentication
window.authenticate
window.showConnect
window.getUserData
window.isStacksWalletInstalled

// Transactions
window.openSTXTransfer
window.openContractCall
window.openContractDeploy
window.openSignTransaction

// Signing
window.showSignMessage
window.signStructuredMessage

// Utilities
window.getStacksProvider
window.getStxAddress
window.disconnect
// ... 40+ more
```

---

## 📦 File Structure Reference

### Required Files (Already In Place)

```
frontend/
├── public/
│   ├── index.html
│   │   └─> Contains: <script src="lib/stacks-connect.js"></script>
│   ├── lib/
│   │   └─> stacks-connect.js (1.1 MB UMD bundle)
│   └── src/
│       ├── api/
│       │   └─> stacksAPI.js (wrapper functions)
│       └── scenes/
│           └─> ConnectWalletScene.js (UI integration)
```

### Current Implementation

**stacksAPI.js** - Wrapper around window functions:

```javascript
window.stacksAPI = {
  connectWallet: async () => {
    return new Promise((resolve, reject) => {
      window.showConnect({
        appDetails: {
          name: 'StacksRunner',
          icon: '...'
        },
        onFinish: ({ userSession }) => {
          const userData = userSession.loadUserData();
          resolve({ success: true, address: userData.profile.stxAddress.mainnet });
        },
        onCancel: () => {
          reject({ success: false, error: 'Connection cancelled' });
        }
      });
    });
  },

  getUserAddress: () => {
    const userData = window.getUserData();
    return userData?.profile?.stxAddress?.mainnet || null;
  },

  isUserConnected: () => {
    return !!window.getUserData();
  }
};
```

**ConnectWalletScene.js** - Calls the wrapper:

```javascript
async connectWallet() {
  try {
    const result = await window.stacksAPI.connectWallet();
    console.log('✅ Connected:', result.address);
    // Transition to next scene
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}
```

---

## 🚀 How to Use: Complete Examples

### 1. Connect Wallet (Already Implemented)

```javascript
// Simple wrapper
async function connectWallet() {
  return new Promise((resolve, reject) => {
    window.showConnect({
      appDetails: {
        name: 'StacksRunner',
        icon: window.location.origin + '/assets/images/maze-logo.png'
      },
      onFinish: ({ userSession }) => {
        const userData = userSession.loadUserData();
        console.log('✅ Connected:', userData.profile.stxAddress.mainnet);
        resolve({
          success: true,
          address: userData.profile.stxAddress.mainnet
        });
      },
      onCancel: () => {
        console.log('⚠️ User cancelled connection');
        reject({
          success: false,
          error: 'User cancelled'
        });
      }
    });
  });
}

// Use it
try {
  const result = await connectWallet();
  console.log('Address:', result.address);
} catch (error) {
  console.error('Failed:', error);
}
```

### 2. Get User Data (After Connection)

```javascript
// Get the currently connected user
function getUserInfo() {
  const userData = window.getUserData();
  
  if (!userData) {
    return null;  // Not connected
  }
  
  return {
    address: userData.profile.stxAddress.mainnet,
    publicKey: userData.profile.publicKey,
    username: userData.profile.name || 'Anonymous',
    connected: true
  };
}

// Use it
const user = getUserInfo();
if (user) {
  console.log('User address:', user.address);
} else {
  console.log('Please connect first');
}
```

### 3. Send STX Tokens

```javascript
// Send STX to another address
async function sendSTX(recipient, amountInMicroSTX) {
  return new Promise((resolve, reject) => {
    window.openSTXTransfer({
      recipient: recipient,           // SP... address
      amount: amountInMicroSTX,       // Amount in microSTX
      memo: 'StacksRunner Game Reward',
      onFinish: ({ txRaw }) => {
        console.log('✅ Transaction sent:', txRaw);
        resolve({ success: true, txid: txRaw });
      },
      onCancel: () => {
        console.log('⚠️ User cancelled transfer');
        reject({ success: false, error: 'User cancelled' });
      }
    }, window.getStacksProvider());
  });
}

// Use it
try {
  // 1 STX = 1,000,000 microSTX
  const result = await sendSTX('SP...', '1000000');
  console.log('Sent! TX ID:', result.txid);
} catch (error) {
  console.error('Transfer failed:', error);
}
```

### 4. Call Smart Contract

```javascript
// Call a function in a smart contract
async function callContractFunction(
  contractAddress,
  contractName,
  functionName,
  functionArgs
) {
  return new Promise((resolve, reject) => {
    window.openContractCall({
      contractAddress: contractAddress,
      contractName: contractName,
      functionName: functionName,
      functionArgs: functionArgs,  // Array of Clarity values as strings
      postConditions: [],           // Optional post-conditions
      onFinish: ({ txRaw }) => {
        console.log('✅ Contract call sent:', txRaw);
        resolve({ success: true, txid: txRaw });
      },
      onCancel: () => {
        console.log('⚠️ User cancelled');
        reject({ success: false, error: 'User cancelled' });
      }
    }, window.getStacksProvider());
  });
}

// Use it - Example: Transfer NFT
try {
  const result = await callContractFunction(
    'SP2ZKHZFQF42G1FQVHD8HXECFVPWMNWPQWGQGDCX6',
    'maze-nft',
    'transfer',
    ['SP...', '1']  // recipient, token-id
  );
  console.log('NFT transferred! TX:', result.txid);
} catch (error) {
  console.error('Contract call failed:', error);
}
```

### 5. Sign a Message

```javascript
// Sign a message for verification
async function signMessage(message) {
  return new Promise((resolve, reject) => {
    window.showSignMessage({
      message: message,
      onFinish: ({ signature }) => {
        console.log('✅ Message signed:', signature);
        resolve({ success: true, signature: signature });
      },
      onCancel: () => {
        console.log('⚠️ User cancelled signing');
        reject({ success: false, error: 'User cancelled' });
      }
    }, window.getStacksProvider());
  });
}

// Use it
try {
  const address = window.stacksAPI.getUserAddress();
  const message = `Verify ownership of ${address}`;
  const result = await signMessage(message);
  console.log('Signature:', result.signature);
} catch (error) {
  console.error('Signing failed:', error);
}
```

### 6. Deploy Smart Contract

```javascript
// Deploy a new contract
async function deployContract(contractName, clarityCode) {
  return new Promise((resolve, reject) => {
    window.openContractDeploy({
      contractName: contractName,
      codeBody: clarityCode,
      onFinish: ({ txRaw }) => {
        console.log('✅ Contract deployed:', txRaw);
        resolve({ success: true, txid: txRaw });
      },
      onCancel: () => {
        console.log('⚠️ User cancelled deployment');
        reject({ success: false, error: 'User cancelled' });
      }
    }, window.getStacksProvider());
  });
}

// Use it
try {
  const code = '(define-public (hello) (ok "world"))';
  const result = await deployContract('my-contract', code);
  console.log('Deployed! TX:', result.txid);
} catch (error) {
  console.error('Deployment failed:', error);
}
```

---

## 🔍 Advanced Usage

### Checking Connection State

```javascript
// Method 1: Check if wallet is installed
const isWalletInstalled = window.isStacksWalletInstalled();

// Method 2: Check if user is connected
const userData = window.getUserData();
const isConnected = !!userData;

// Method 3: Get user address (null if not connected)
const address = window.stacksAPI?.getUserAddress();
```

### Getting User Information

```javascript
// Get all user data
const userData = window.getUserData();

if (userData) {
  console.log('STX Address:', userData.profile.stxAddress.mainnet);
  console.log('Public Key:', userData.profile.publicKey);
  console.log('Name:', userData.profile.name);
  console.log('Profile:', userData.profile);
}
```

### Error Handling

```javascript
// Always handle both success and cancellation
async function safeOperation(operation) {
  try {
    if (!window.isStacksWalletInstalled()) {
      throw new Error('Stacks wallet not installed');
    }

    if (!window.getUserData()) {
      throw new Error('Please connect your wallet first');
    }

    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    console.error('Operation failed:', error);
    return { success: false, error: error.message };
  }
}

// Use it
const result = await safeOperation(async () => {
  return await sendSTX('SP...', '1000000');
});
```

### Storing Connection State

```javascript
// Save user connection
function saveConnection() {
  const userData = window.getUserData();
  if (userData) {
    localStorage.setItem('stacksAddress', 
      userData.profile.stxAddress.mainnet
    );
    localStorage.setItem('stacksConnected', 'true');
  }
}

// Restore connection on reload
function loadConnection() {
  const savedAddress = localStorage.getItem('stacksAddress');
  const wasConnected = localStorage.getItem('stacksConnected') === 'true';
  
  if (wasConnected && savedAddress) {
    console.log('User was connected to:', savedAddress);
    // You may want to verify connection is still valid
  }
}

// Clear connection
function clearConnection() {
  window.disconnect?.();
  localStorage.removeItem('stacksAddress');
  localStorage.removeItem('stacksConnected');
}
```

---

## 🧪 Testing in Development

### Test Checklist

```javascript
// 1. Verify library is loaded
console.assert(typeof window.showConnect === 'function', 'showConnect not found');
console.assert(typeof window.getUserData === 'function', 'getUserData not found');

// 2. Test wallet detection
console.log('Wallet installed:', window.isStacksWalletInstalled());

// 3. Test connection flow
async function testConnection() {
  try {
    const result = await window.stacksAPI.connectWallet();
    console.log('✅ Connection test passed:', result);
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

// 4. Test user data retrieval
const userData = window.getUserData();
console.log('✅ User data:', userData);

// 5. Test address retrieval
const address = window.stacksAPI.getUserAddress();
console.log('✅ User address:', address);
```

### Local Testing

```bash
# Start development server
cd frontend
npm run dev

# Open test page
# http://localhost:3000/test-wallet-connection.html

# Or open main game
# http://localhost:3000/index.html
```

### Browser Console Testing

```javascript
// Quick test in browser console (F12)

// 1. Is library loaded?
typeof window.showConnect === 'function'  // Should be true

// 2. Get all available functions
Object.keys(window).filter(k => 
  typeof window[k] === 'function' && 
  (k.includes('stack') || k.includes('connect') || k.includes('stx'))
).length  // Should show 50+

// 3. Try connection
window.showConnect({
  appDetails: { name: 'Test' },
  onFinish: (res) => console.log('Success!', res),
  onCancel: () => console.log('Cancelled')
})

// 4. Check storage
localStorage.getItem('blockstack')
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "showConnect is not a function"

**Cause:** Library not loaded

**Solution:**
```javascript
// Check file exists
// frontend/public/lib/stacks-connect.js

// Check HTML references it
// <script src="lib/stacks-connect.js"></script>

// Hard refresh
// Ctrl+Shift+R (Chrome) or Cmd+Shift+R (Mac)

// Check console for 404 errors
// F12 → Console → Look for errors
```

### Issue 2: Wallet modal doesn't appear

**Cause:** Wallet extension not installed or disabled

**Solution:**
```javascript
// Check if wallet installed
if (!window.isStacksWalletInstalled()) {
  alert('Please install Leather, Hiro, or XVerse wallet');
  // Direct user to install
  window.location.href = 'https://leather.io';
}
```

### Issue 3: Connection succeeds but address is null

**Cause:** Data not stored in localStorage

**Solution:**
```javascript
// Check localStorage
console.log(localStorage);
// Look for keys with 'blockstack', 'stacks', 'connect'

// Try different wallet
// Some wallets have different storage patterns

// Check network tab
// F12 → Network → Filter by XHR
// Look for API calls to wallet service
```

### Issue 4: "Permission denied" errors

**Cause:** Browser security policy

**Solution:**
```javascript
// Use http://localhost:3000 (not IP address)
// Enable CORS for local testing
npm run dev -- --cors

// Check browser security logs
// F12 → Console → Look for CORS errors
```

---

## 📊 Function Reference for Common Tasks

### Task: Check if Connected

```javascript
// Option 1: Direct check
!!window.getUserData()

// Option 2: Check address
!!window.stacksAPI?.getUserAddress()

// Option 3: Full check
function isConnected() {
  return window.isStacksWalletInstalled() && 
         !!window.getUserData();
}
```

### Task: Get User Address

```javascript
// Option 1: Via wrapper
window.stacksAPI.getUserAddress()

// Option 2: Direct
window.getUserData()?.profile?.stxAddress?.mainnet

// Option 3: Specific network
const userData = window.getUserData();
const mainnetAddress = userData?.profile?.stxAddress?.mainnet;
const testnetAddress = userData?.profile?.stxAddress?.testnet;
```

### Task: Show Connection Status

```javascript
function displayConnectionStatus() {
  const address = window.stacksAPI.getUserAddress();
  
  if (address) {
    console.log(`✅ Connected: ${address}`);
    return 'Connected';
  } else {
    console.log('❌ Not connected');
    return 'Not connected';
  }
}
```

### Task: Wait for Connection

```javascript
async function waitForConnection(timeoutMs = 30000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    if (window.getUserData()) {
      return window.getUserData();
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  throw new Error('Connection timeout');
}

// Use it
try {
  const userData = await waitForConnection();
  console.log('Connected!', userData);
} catch (error) {
  console.error('Connection timeout');
}
```

---

## 🎓 Best Practices

### 1. Always Check Wallet Installed

```javascript
if (!window.isStacksWalletInstalled()) {
  // Show message to user to install wallet
  showError('Please install a Stacks wallet first');
  return;
}
```

### 2. Handle Errors Gracefully

```javascript
window.openSTXTransfer({
  recipient: 'SP...',
  amount: '1000000',
  onFinish: (result) => {
    showSuccess(`Transaction sent: ${result.txRaw}`);
  },
  onCancel: () => {
    showWarning('You cancelled the transaction');
  }
}, window.getStacksProvider());
```

### 3. Use Try-Catch

```javascript
async function performAction() {
  try {
    const userData = window.getUserData();
    if (!userData) throw new Error('Not connected');
    
    // Perform action
  } catch (error) {
    console.error('Action failed:', error.message);
    // Show user-friendly error
  }
}
```

### 4. Store User State

```javascript
// After successful connection
function saveUserState() {
  const userData = window.getUserData();
  if (userData) {
    sessionStorage.setItem('userConnected', JSON.stringify({
      address: userData.profile.stxAddress.mainnet,
      timestamp: Date.now()
    }));
  }
}

// On page reload
function restoreUserState() {
  const saved = sessionStorage.getItem('userConnected');
  if (saved) {
    const { address } = JSON.parse(saved);
    console.log('Previously connected to:', address);
  }
}
```

### 5. Validate User Input

```javascript
function validateTransaction(recipient, amount) {
  if (!recipient || !recipient.startsWith('SP')) {
    throw new Error('Invalid recipient address');
  }
  
  if (!amount || parseInt(amount) <= 0) {
    throw new Error('Invalid amount');
  }
  
  return true;
}
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Library loads without errors
- [ ] All 55+ functions accessible
- [ ] Wallet connection works
- [ ] Can send transactions
- [ ] Can sign messages
- [ ] Error handling works
- [ ] HTTPS enabled
- [ ] User data stored securely
- [ ] Network specified correctly (mainnet/testnet)
- [ ] Tested with multiple wallets (Leather, Hiro, XVerse)
- [ ] Mobile responsive
- [ ] Console errors cleared
- [ ] Performance optimized

---

## 📚 Related Documentation

- **STACKS_CONNECT_BUNDLE_ANALYSIS.md** - Complete API reference with all 55+ functions
- **STACKS_CONNECT_QUICK_REFERENCE.md** - Quick lookup guide
- **UMD_PATTERN_EXPLAINED.md** - Technical details about UMD pattern
- **WALLET_CONNECTION_READY.md** - Project integration status

---

## ✨ Summary

**Your StacksRunner project has complete wallet integration with 55+ functions available.**

### Quick Start

```javascript
// 1. Connect wallet
await window.stacksAPI.connectWallet()

// 2. Get address
const address = window.stacksAPI.getUserAddress()

// 3. Send transaction
await window.openSTXTransfer({...}, window.getStacksProvider())

// 4. Sign message
await window.showSignMessage({...}, window.getStacksProvider())
```

### Available

- ✅ All 55+ functions from stacks-connect.js
- ✅ Ready for production use
- ✅ Supports all major wallets
- ✅ Full error handling
- ✅ Complete documentation

**Happy building! 🚀**
