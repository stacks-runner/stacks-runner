# Wallet Connection Quick Start Guide

## Testing the Fix (5 minutes)

### Step 1: Start the Development Server
```bash
cd frontend
npm start
# or
npm run dev
```

Server runs on `http://localhost:3000`

### Step 2: Open the Debugging Page
1. Open browser to: `http://localhost:3000/debug-stacks.html`
2. You should see a green terminal-style interface
3. The page will auto-run checks on load

### Step 3: Check Initialization
Look for these messages in the debug page (should be green ✅):

```
✅ PAGE LOADED
✅ areStacksLibrariesLoaded(): true (or will show detected globals)
✅ Found related globals: showConnect, openSTXTransfer, openContractCall...
✅ Extracted Stacks.js functions from global scope
```

### Step 4: Test Wallet Connection
1. On debug page, click **"🧪 Test Connect"** button
2. Should see:
   - "⏳ Waiting for StacksConnect library to load..."
   - Then wallet selection dialog appears (Leather wallet option)
3. Select Leather wallet from the dialog
4. Connect and approve

### Step 5: Main Game Test
1. Go to `http://localhost:3000`
2. Should see title screen without errors
3. Click "Connect Wallet" on next screen
4. Wallet dialog should appear
5. Complete connection

## Browser Console Debugging

Press **F12** to open Developer Tools → Console tab

### Check Library Status
```javascript
// Check if loader finished
window.areStacksLibrariesLoaded()  // Should return true

// Get the library object
window.getStacksLib()  // Should show object with showConnect, openSTXTransfer, etc.

// Check if stacksAPI is ready
window.stacksAPI  // Should show StacksAPI instance

// Test wallet connection (will open wallet dialog)
await window.stacksAPI.connectWallet()
```

### Common Error Messages & Fixes

#### Error: "StacksConnect library not loaded"
**Cause**: Library didn't load from CDN  
**Fix**:
1. Check Network tab - see if CDN URLs loaded successfully
2. Check for CORS errors
3. Try opening debug page: `debug-stacks.html`

#### Error: "showConnect is not a function"
**Cause**: Library loaded but functions not accessible  
**Fix**:
1. Run in console: `Object.keys(window.stacksLib)`
2. Should show: `['showConnect', 'openSTXTransfer', 'openContractCall', ...]`
3. If empty, check browser console for library load errors

#### CDN Blocked / CORS Error
**Cause**: Network or firewall blocking unpkg.com  
**Fix**:
1. Check company firewall/proxy settings
2. Try VPN if on restricted network
3. Alternative: Use jsDelivr CDN instead (see below)

## Alternative: Using jsDelivr CDN

If unpkg.com is blocked, edit `index.html`:

```html
<!-- Replace this line: -->
<script defer src="https://unpkg.com/@stacks/connect@7.4.0/dist/index.global.js"></script>

<!-- With this: -->
<script defer src="https://cdn.jsdelivr.net/npm/@stacks/connect@7.4.0/dist/index.global.js"></script>
```

## Files to Know

- **Game Start**: `/index.html` - Main entry point
- **Debug Tool**: `/debug-stacks.html` - Diagnostics page
- **Library Loader**: `/src/api/stacksLoader.js` - New library loader
- **Wallet API**: `/src/api/stacksAPI.js` - Updated to use loader
- **Boot Scene**: `/src/scenes/BootScene.js` - Fixed (removed invalid initialize call)

## What Was Fixed

1. ✅ **Library Loading**: Added `stacksLoader.js` to properly capture @stacks/connect
2. ✅ **Script Order**: Ensured libraries load in correct order with `defer` attribute
3. ✅ **Global Access**: Libraries now available as `window.stacksLib`
4. ✅ **Error Handling**: Better error messages with debugging info
5. ✅ **Boot Scene**: Removed invalid `initialize()` call that was causing errors

## Success Indicators

When wallet connection works, you should see:

### In Console
```
✅ Stacks.js Library Loader v2 initializing...
✅ Found showConnect in global scope
✅ Extracted Stacks.js functions from global scope
✅ Stacks.js libraries loaded and assigned to window.stacksLib
✅ StacksAPI instance created
```

### In Game
- Title screen appears without errors
- "Connect Wallet" button works
- Clicking it opens Leather wallet dialog
- After wallet connection, you can play the game

## Next Steps After Verification

1. **Deploy to production** once you verify locally
2. **Test with Leather wallet** extension installed
3. **Monitor browser console** for any new errors
4. **Collect user feedback** on wallet connection experience

## Need More Help?

See these documentation files:
- `STACKS_LIBRARY_LOADER_SOLUTION.md` - Technical details
- `WALLET_CONNECTION_FIX_COMPLETE.md` - Previous fixes
- `WALLET_CONNECTION_TEST_GUIDE.md` - Comprehensive testing guide
