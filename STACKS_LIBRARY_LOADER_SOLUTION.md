# Wallet Connection Fix - CDN Library Loading Solution

**Status**: ✅ COMPLETE (Phase 2 - Library Loading Strategy)  
**Date**: October 17, 2025

## Problem Summary

The wallet connection was failing with:
```
Error: StacksConnect library not loaded. Check that Stacks.js CDN scripts are loading.
```

**Root Cause**: The @stacks/connect UMD bundle from unpkg.com was not properly exposing its functions to the global window object in a way that stacksAPI.js could access them.

## Solution Architecture

### New Components Created

#### 1. **stacksLoader.js** (src/api/stacksLoader.js)
A new library loader that:
- Executes BEFORE the Stacks.js CDN scripts
- Waits for the @stacks/connect library to load and execute
- Detects where the library exports its functions (multiple possible locations)
- Assigns the library to `window.stacksLib` for consistent access
- Provides helper functions: `areStacksLibrariesLoaded()` and `getStacksLib()`
- Fires a `stacksLibrariesLoaded` custom event when ready

**Key Features**:
- Robust library detection with multiple fallback strategies
- Handles UMD bundle variations across different versions
- Comprehensive logging for debugging
- Non-blocking initialization (doesn't break if library fails to load)

#### 2. **Updated stacksAPI.js**
Modified to:
- Use `window.stacksLib` as the primary source (set by stacksLoader)
- Enhanced `findStacksConnect()` to check stacksLib first
- Improved `ensureStacksConnect()` with better waiting logic and error messages
- Better debugging output showing available functions

#### 3. **Updated index.html**
Script loading order fixed:
```html
<!-- 1. Phaser.js (no defer) -->
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>

<!-- 2. Stacks Loader (defer, executes early) -->
<script defer src="src/api/stacksLoader.js"></script>

<!-- 3. Stacks.js Libraries (defer, loader captures them) -->
<script defer src="https://unpkg.com/@stacks/connect@7.4.0/dist/index.global.js"></script>
<script defer src="https://unpkg.com/@stacks/transactions@6.5.4/dist/transactions.umd.js"></script>
<script defer src="https://unpkg.com/@stacks/network@6.5.4/dist/network.umd.js"></script>

<!-- 4. Game Code (defer, loads after libraries) -->
<script defer src="src/config.js"></script>
<script defer src="src/api/stacksAPI.js"></script>
<!-- ... other game scripts ... -->
```

#### 4. **debug-stacks.html** 
A debugging page to:
- Scan all global variables for Stacks functions
- Check if loader initialized successfully
- Test the wallet connection
- Provide detailed error information

## How It Works

### Initialization Sequence

1. **Page Load**
   - HTML parser encounters `<script defer src="src/api/stacksLoader.js">`
   - Loader IIFE executes immediately
   - Loader sets up `window.stacksLib = {}`

2. **Stacks.js Libraries Load**
   - `@stacks/connect/dist/index.global.js` loads
   - UMD bundle executes and exports functions to global scope
   - Loader detects the exported functions

3. **Loader Detection & Assignment**
   - Loader waits (via polling) for library to be available
   - Checks multiple possible global locations:
     - `showConnect` (global function)
     - `window.StacksConnect.showConnect` (namespaced)
     - `window.stacksConnect.showConnect` (camelCase)
     - `window.stacks.connect.showConnect` (nested)
     - Or searches all globals for matching functions
   - Assigns to `window.stacksLib` for consistent access

4. **stacksAPI Initialization**
   - stacksAPI loads and creates instance
   - Tries to find `window.stacksLib.showConnect`
   - If not found, awaits with polling (max 10 seconds)
   - Once found, uses it for wallet operations

### Multiple Fallback Strategies

The loader tries these strategies in order:

1. **Direct Global Functions**: `showConnect`, `openSTXTransfer`, etc.
2. **window.StacksConnect**: Namespaced object
3. **window.stacksConnect**: CamelCase variant
4. **window.stacks.connect**: Nested namespace
5. **window["@stacks/connect"]**: Bracketed package name
6. **Brute Force Search**: Scan all window properties

Each strategy is logged for debugging.

## Testing

### Quick Test
Open `/debug-stacks.html` in browser:
- Shows all detected Stacks functions
- Displays loader status
- Allows testing wallet connection
- Provides detailed error messages

### Manual Test
1. Open developer console
2. Check for messages:
   ```
   ✅ Stacks.js Library Loader v2 initializing...
   ✅ Found showConnect in global scope
   ✅ StacksConnect loaded after XXX ms
   ✅ StacksAPI ready
   ```
3. Try connecting wallet from game

### Browser Console Commands
```javascript
// Check if libraries loaded
window.areStacksLibrariesLoaded()

// Get the library object
window.getStacksLib()

// Try wallet connection
await window.stacksAPI.connectWallet()
```

## Files Modified

1. **frontend/public/src/api/stacksLoader.js** - NEW
2. **frontend/public/src/api/stacksAPI.js** - Updated
3. **frontend/public/index.html** - Script order updated
4. **frontend/public/debug-stacks.html** - NEW (debugging aid)

## Troubleshooting

### Library Still Not Loading
1. Check network tab - CDN URLs should load successfully
2. Check browser console for CORS errors
3. Use `/debug-stacks.html` to see what's available globally
4. Try alternative CDN (jsDelivr vs unpkg)

### Wallet Connection Still Fails
1. Run debug page and note available functions
2. Check if `window.stacksLib` exists
3. Verify `showConnect` is a function
4. Look for errors in console

### Performance Issues
- Loader waits up to 10 seconds for library
- Polling interval is 200ms (50 attempts)
- Can be tuned in `ensureStacksConnect()` method

## Future Improvements

1. **Alternative CDN**: Add jsDelivr as fallback
   ```html
   <script defer src="https://cdn.jsdelivr.net/npm/@stacks/connect@7.4.0/dist/index.global.js"></script>
   ```

2. **NPM Installation**: Bundle Stacks.js with app
   ```bash
   npm install @stacks/connect @stacks/transactions @stacks/network
   ```

3. **Webpack/Bundler**: Use proper module bundler instead of CDN

4. **Library Version Management**: Implement semantic versioning checks

## Verification Checklist

- [x] stacksLoader.js created and functional
- [x] stacksAPI.js updated to use window.stacksLib
- [x] index.html script order corrected
- [x] BootScene.js fixed (removed invalid initialize call)
- [x] Wallet connection method enhanced
- [x] Error messages improved
- [x] Debug page created
- [x] Logging throughout the process
- [ ] Browser testing with real Leather wallet
- [ ] Testing on mobile devices
- [ ] Performance optimization

## Success Indicators

When working correctly, you should see in console:

```
✅ Stacks.js Library Loader v2 initializing...
⏳ Waiting for @stacks/connect to load from CDN...
✅ Found showConnect in global scope (attempt X)
✅ Extracted Stacks.js functions from global scope
✅ Stacks.js libraries loaded and assigned to window.stacksLib
✅ StacksAPI instance created
✅ StacksAPI ready - waiting for @stacks/connect via UMD CDN
```

Then when connecting:
```
⏳ Waiting for StacksConnect library to load...
✅ StacksConnect already available
✅ Wallet connection finished
📍 STX Address: SP...
```

## Next Steps

1. **Test the fix**: Open the game and try connecting a wallet
2. **Use debug page**: Open `/debug-stacks.html` for diagnostics
3. **Deploy**: Once verified, push to production
4. **Monitor**: Watch browser console for any new errors
5. **Collect feedback**: Test with real Leather wallet

---

**Related Files**:
- See WALLET_CONNECTION_FIX_COMPLETE.md for previous fixes
- See WALLET_CONNECTION_TEST_GUIDE.md for testing procedures
- See debug-stacks.html for debugging assistance
