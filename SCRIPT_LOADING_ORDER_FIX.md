# ✅ Script Loading Order Fix

## Problem
```
❌ Failed to connect wallet: Error: StacksAPI not initialized. Please refresh the page.
```

**Root Cause**: All scripts in `index.html` had `defer` attribute, causing them to load in parallel. When `ConnectWalletScene.js` tried to call `window.stacksAPI.connectWallet()`, the `stacksAPI.js` script hadn't executed yet, so `window.stacksAPI` was `undefined`.

## Solution
Changed the loading order in `index.html`:

### Before (All deferred - race condition)
```html
<script defer src="src/config.js"></script>
<script defer src="src/api/stacksAPI.js"></script>
<script defer src="src/utils/mazeGenerator.js"></script>
<!-- ... all other scripts with defer ... -->
```

### After (Proper execution order)
```html
<!-- Phaser (external CDN - loads immediately) -->
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>

<!-- Config and API FIRST (no defer - blocks until executed) -->
<script src="src/config.js"></script>
<script src="src/api/stacksAPI.js"></script>

<!-- Utils and Scenes AFTER (with defer - can load in parallel) -->
<script defer src="src/utils/mazeGenerator.js"></script>
<script defer src="src/utils/collisions.js"></script>
<script defer src="src/scenes/BootScene.js"></script>
<!-- ... etc ... -->

<!-- Main entry point LAST (with defer) -->
<script defer src="src/main.js"></script>
```

## How It Works Now

```
1. Phaser loads (external CDN)
2. config.js executes (BLOCKING)
   ↓
3. stacksAPI.js executes (BLOCKING) ✅ window.stacksAPI created here
   ↓
4. Scenes load in parallel (defer) - now window.stacksAPI exists! ✅
   ↓
5. ConnectWalletScene can call window.stacksAPI.connectWallet() ✅
```

## Why This Works

- **Without `defer`**: Scripts block page load but execute in exact order
- **With `defer`**: Scripts load asynchronously but execute in order (BUT only after page parsing)
- **Mixed approach**: Core dependencies without `defer`, everything else with `defer`

This ensures:
1. ✅ `stacksAPI` is ready before any scene tries to use it
2. ✅ Page loads efficiently (scenes load in parallel)
3. ✅ No race conditions
4. ✅ No need to "refresh the page"

## Test the Fix

1. Reload the page (F5)
2. Click "Connect Wallet"
3. Should see: ✅ Wallet connected (not the error)
4. Check browser console - should see `StacksAPI ready` messages

---

**Status**: ✅ FIXED  
**Date**: October 17, 2025  
