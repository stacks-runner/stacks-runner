WALLET_CONNECTION_TEST_GUIDE.md
================================

## Quick Test Guide - Wallet Connection Fix

### Prerequisites
- Local dev server running (or open public/index.html in browser)
- Browser DevTools ready (F12)
- Leather or Hiro wallet extension installed

### Step 1: Verify CDN Libraries Load

**In Browser Console** (F12 → Console tab):

```javascript
// Run these commands to verify libraries loaded
console.log('StacksConnect:', window.StacksConnect);
console.log('StacksAPI:', window.stacksAPI);
console.log('Phaser:', window.Phaser);
```

**Expected Output**:
```
StacksConnect: {showConnect: ƒ, isConnected: ƒ, disconnect: ƒ, ...}
StacksAPI: StacksAPI {userAddress: null, userPublicKey: null, ...}
Phaser: {version: "3.70.0", ...}
```

If you see `undefined` for any, it means CDN didn't load. **Check Network tab for errors.**

### Step 2: Check stacksAPI Initialization

**Expected in Console** (at page load):
```
✅ StacksAPI instance created
✅ @stacks/connect library loaded
✅ StacksAPI ready - waiting for @stacks/connect via UMD CDN
```

If NOT present, check:
1. Refresh page (Ctrl+Shift+R)
2. Check Network tab → verify .umd.js files loaded with 200 status
3. Check for CORS errors

### Step 3: Test Wallet Connection (Full Flow)

#### a) Click "Connect Wallet" Button
   - Location: TitleScene → ConnectWalletScene
   - Expected: Button changes to "Opening wallet..."
   - Check Console: Should see no errors

#### b) Wallet Dialog Opens
   - Expected: Leather or Hiro wallet selection dialog
   - If not: Check browser console for wallet extension errors

#### c) Select Wallet & Approve Connection
   - In Leather/Hiro: Click approve
   - Expected in console:
     ```
     ✅ Wallet connection finished
     📍 STX Address: SP...
     📍 Public Key: 0x...
     ```

#### d) Proceed to MazeCreationScene
   - Expected: Button changes to "✅ Connected!"
   - Scene transitions to MazeCreationScene after 1.5s
   - Scene should display "Create Maze" button

### Step 4: Verify Address Storage

**In DevTools** (F12 → Application/Storage):

```
Local Storage:
  stacksConnect:userSession → Contains wallet data
```

**Or run in console**:
```javascript
window.stacksAPI.getUserAddress()
// Expected: "SP..." (STX address)
```

### Step 5: Test After Page Refresh

After wallet connection:
1. **Refresh page** (F5 or Ctrl+R)
2. Should still be in MazeCreationScene (wallet remembered)
3. Run in console: `window.stacksAPI.isUserConnected()` → Should return `true`

### Step 6: Test Wallet Disconnection (Optional)

```javascript
// In browser console
window.stacksAPI.disconnectWallet();
```

**Expected**:
- Console shows: `✅ User disconnected`
- `window.stacksAPI.getUserAddress()` returns `null`
- Next page load shows TitleScene again

---

## Debugging: Common Issues & Solutions

### Issue 1: "StacksConnect library not loaded"

**Console Output**:
```
❌ Wallet connection failed: StacksConnect library not loaded
Available globals: ...
```

**Solution**:
1. Check Network tab (F12 → Network):
   - Filter: `umd.js`
   - Should see 3 files with status 200:
     - connect.umd.js
     - transactions.umd.js  
     - network.umd.js
2. If red X (failed):
   - Check internet connection
   - Try different CDN mirror (edit index.html CDN URLs)
   - Try `https://cdn.jsdelivr.net/npm/@stacks/connect/dist/connect.umd.js`

### Issue 2: "StacksAPI not initialized"

**Console Output**:
```
Uncaught Error: StacksAPI not initialized. Please refresh the page.
```

**Solution**:
1. Hard refresh (Ctrl+Shift+R)
2. Check browser console at load - should see:
   - `✅ StacksAPI instance created`
   - `✅ @stacks/connect library loaded`
3. Check index.html - verify:
   - `<script defer src="src/api/stacksAPI.js"></script>` is NOT commented out
   - Appears AFTER Stacks.js CDN scripts
   - All scripts have `defer` attribute

### Issue 3: Wallet Dialog Doesn't Open

**Symptoms**:
- Button shows "Opening wallet..." but nothing happens
- No error in console
- After 3-4 seconds button resets with error

**Solution**:
1. Check wallet extension is installed (Leather/Hiro)
2. Check extension is enabled for this domain
3. Check console for specific error message
4. Try different wallet (if have both Leather & Hiro)
5. Check browser privacy settings - allow 3rd party popups

### Issue 4: Address Not Saving After Refresh

**Symptoms**:
- Wallet connects fine
- After refresh, back to TitleScene
- Lost connection

**Solution**:
1. Check browser LocalStorage (DevTools → Application → Storage)
   - Look for key: `stacksConnect:userSession`
   - If missing, wallet connection didn't save properly
2. Check if browser has localStorage disabled
3. Check if in private/incognito mode (localStorage disabled)
4. Try clearing cache and reconnecting

---

## Performance Checks

### Network Performance (Goal: <3s total load)

**DevTools → Network tab**:

| Resource | Size | Time |
|----------|------|------|
| phaser.min.js | ~800KB | <1s |
| connect.umd.js | ~50KB | <500ms |
| transactions.umd.js | ~40KB | <500ms |
| network.umd.js | ~5KB | <200ms |
| config.js | ~2KB | <100ms |
| stacksAPI.js | ~8KB | <100ms |
| Other scenes | ~30KB | <500ms |

If any timing out, check CDN status or network connection.

### Memory Check (Optional)

Run in console to check memory usage:
```javascript
// Check StacksAPI object size
JSON.stringify(window.stacksAPI).length
// Expected: <1KB

// Check localStorage usage
new Blob(Object.values(localStorage)).size
// Expected: <10KB
```

---

## Testing Checklist

Use this checklist to verify full wallet integration:

```
PRE-LOAD:
☐ No console errors at startup
☐ StacksAPI logs appear in console
☐ Phaser loads successfully

WALLET CONNECTION:
☐ "Connect Wallet" button visible
☐ Button clickable (no JS errors)
☐ "Opening wallet..." appears on click
☐ Wallet dialog opens (Leather/Hiro)
☐ Approval in wallet works
☐ Address appears in console logs
☐ "✅ Connected!" appears on button

PERSISTENCE:
☐ localStorage shows stacksConnect:userSession
☐ Page refresh maintains connection
☐ isUserConnected() returns true after refresh

DISCONNECT:
☐ Can call disconnectWallet() in console
☐ Address cleared from localStorage
☐ Next refresh shows TitleScene again
☐ isUserConnected() returns false

NEXT SCENE:
☐ After connection, proceeds to MazeCreationScene
☐ Scene displays correctly
☐ "Create Maze" button visible
```

---

## Next Steps After Testing

Once wallet connection works:

1. **Deploy test contract** to Stacks testnet
2. **Update contract address** in stacksAPI.js
3. **Test game creation** (requires contract deployment)
4. **Test score submission** (requires contract deployment)
5. **Test reward claiming** (requires contract deployment)

For contract deployment:
- See `/contracts/MazeGame.clar`
- Use Clarinet: `clarinet console` or `clarinet publish`
- Update `this.contractAddress` in stacksAPI.js with deployed address

---

## Emergency: Fallback Debug Mode

If everything fails, run this in console:

```javascript
// Full diagnostic
console.group('🔍 StacksRunner Diagnostics');

console.log('1. Global Objects:');
console.log('  - window.StacksConnect:', !!window.StacksConnect);
console.log('  - window.StacksAPI:', !!window.stacksAPI);
console.log('  - window.Phaser:', !!window.Phaser);

console.log('2. StacksAPI Status:');
console.log('  - Address:', window.stacksAPI?.getUserAddress() || 'null');
console.log('  - Connected:', window.stacksAPI?.isUserConnected() || false);

console.log('3. Available Functions:');
console.log('  - showConnect:', !!window.StacksConnect?.showConnect);
console.log('  - openContractCall:', !!window.StacksConnect?.openContractCall);
console.log('  - openSTXTransfer:', !!window.StacksConnect?.openSTXTransfer);

console.log('4. LocalStorage:');
console.log('  - stacksConnect:userSession:', !!localStorage.getItem('stacksConnect:userSession'));

console.groupEnd();
```

Copy output and share with dev team if issues persist.
