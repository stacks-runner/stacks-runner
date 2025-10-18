MODULE_RESOLUTION_ERROR_FIX.md
=============================

## Issue

**Error**: "Failed to resolve module specifier @stacks/connect. Relative references must start with either '/', './', '../'"

**When**: After clicking "Connect Wallet" button

**Cause**: Browser is trying to parse ES6 import statements, but:
- stacksAPI.js doesn't have imports anymore (fixed)
- BUT browser might be loading cached old version
- OR there's another file trying to import @stacks/connect

## Solution

### Step 1: Clear Browser Cache
This is the most common cause - browser has old cached version.

**Option A: Hard Refresh (Easiest)**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Option B: DevTools Cache Clear**
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache"
4. Refresh page (F5)
5. Keep DevTools open while testing

**Option C: Full Cache Clear**
1. Open DevTools (F12)
2. Right-click reload button
3. Select "Empty cache and hard reload"

### Step 2: Verify Correct File is Loading

In Browser Console, run:
```javascript
// Should show the NEW correct stacksAPI
console.log(window.stacksAPI);
console.log(window.stacksAPI.getStacksConnect);
```

**Expected Output**:
```
StacksAPI {
  userAddress: null
  userPublicKey: null
  contractAddress: "ST1PQHQKV0..."
  checkStacksLibraries: ƒ
  getStacksConnect: ƒ
}
ƒ getStacksConnect()
```

### Step 3: Verify CDN Scripts Loaded

In Browser Console:
```javascript
// Check if UMD libraries loaded
console.log('StacksConnect:', window.StacksConnect);
console.log('StacksTransactions:', window.StacksTransactions);
console.log('StacksNetwork:', window.StacksNetwork);
```

**Expected**: All three should show objects with methods, NOT `undefined`

### Step 4: Test Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for these files - should all show **200** status:
   - `connect.umd.js` (from unpkg.com) ✅
   - `transactions.umd.js` (from unpkg.com) ✅
   - `network.umd.js` (from unpkg.com) ✅
   - `stacksAPI.js` (from your server) ✅

**If any show RED (4xx/5xx error)**:
- CDN might be down
- Try different CDN mirror
- Check internet connection

## Common Issues & Fixes

### Issue 1: Still Getting Import Error After Hard Refresh

**Cause**: Might be loading from `src/blockchain/stacksAPI.js` instead of `src/api/stacksAPI.js`

**Fix**:
1. Check browser Network tab
2. Look for stacksAPI.js request
3. Right-click → Copy full URL
4. Should be: `.../src/api/stacksAPI.js` ✅
5. If it shows `.../src/blockchain/stacksAPI.js` ❌ - DELETE that file

### Issue 2: CDN Scripts Not Loading (404 or 5xx)

**Cause**: CDN mirror down or network issue

**Solution**:
Try alternative CDN in index.html:

```html
<!-- OPTION A: Use jsDelivr instead of unpkg -->
<script defer src="https://cdn.jsdelivr.net/npm/@stacks/connect@7.4.0/dist/connect.umd.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/@stacks/transactions@6.5.4/dist/transactions.umd.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/@stacks/network@6.5.4/dist/network.umd.js"></script>

<!-- OPTION B: Use skypack -->
<script defer src="https://cdn.skypack.dev/@stacks/connect@7.4.0"></script>
<script defer src="https://cdn.skypack.dev/@stacks/transactions@6.5.4"></script>
<script defer src="https://cdn.skypack.dev/@stacks/network@6.5.4"></script>
```

### Issue 3: StacksConnect Methods Don't Exist

**Error**: `StacksConnect.showConnect is not a function`

**Cause**: CDN loaded but doesn't have UMD export correctly

**Solution**:
1. Check Console - what does `window.StacksConnect` show?
2. If it's an object with just metadata (not functions), CDN didn't load correctly
3. Try different CDN URL from options above

### Issue 4: Browser Console Shows Network Error

**Example**: `Failed to load resource: net::ERR_BLOCKED_BY_CLIENT`

**Cause**: Browser extension or firewall blocking CDN

**Solution**:
1. Disable extensions temporarily
2. Check firewall/proxy settings
3. Try different network
4. Use VPN if needed

## Complete Testing Procedure

### Test 1: Verify File Content
```bash
# Check stacksAPI.js has NO import statements
grep -i "import.*stacks" /home/izk/Documents/stacks-runner/frontend/public/src/api/stacksAPI.js

# Expected output: Nothing (0 results)
```

### Test 2: Verify index.html Has Correct Scripts
```bash
# Check stacksAPI script included
grep "src/api/stacksAPI" /home/izk/Documents/stacks-runner/frontend/public/index.html

# Expected: <script defer src="src/api/stacksAPI.js"></script>
```

### Test 3: Browser Console Test
1. Open frontend in browser
2. Open DevTools (F12)
3. Go to Console tab
4. Run these commands:

```javascript
// Test 1: Check globals exist
window.StacksConnect ? '✅ StacksConnect' : '❌ Missing'
window.stacksAPI ? '✅ stacksAPI' : '❌ Missing'

// Test 2: Check methods exist
typeof window.stacksAPI.connectWallet === 'function' ? '✅ connectWallet' : '❌ Missing'

// Test 3: Check getStacksConnect works
window.stacksAPI.getStacksConnect() ? '✅ getStacksConnect works' : '❌ Failed'

// Test 4: Try connect
window.stacksAPI.connectWallet().then(r => console.log('Result:', r))
```

### Test 4: Network Inspection
1. Open Network tab
2. Filter by CDN domains:
   - unpkg.com
   - cdn.jsdelivr.net
   - cdn.skypack.io
3. All should have status 200
4. Look for size > 0 (content loaded)

## Quick Fix Checklist

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Open DevTools → Application/Storage
- [ ] Clear all cache for this domain
- [ ] Refresh page
- [ ] Check Network tab - all CDN scripts 200 status
- [ ] Console shows no errors
- [ ] Click Connect Wallet again
- [ ] Wallet dialog opens (no module error)

## If Still Not Working

Try this comprehensive reset:

1. **Close all browser tabs** with your game
2. **Clear browser cache completely**:
   - Chrome: Settings → Privacy → Clear browsing data (ALL TIME)
   - Firefox: History → Clear Recent History (select All)
   - Safari: History → Clear History
3. **Close and reopen browser**
4. **Open game in new tab**
5. **Hard refresh** (Ctrl+Shift+R)
6. **Wait 5 seconds** for CDN to load
7. **Click Connect Wallet**
8. **Check Console** for errors

## Production Deployment Note

If deploying to production:

1. **Test on new network** (not your dev machine)
2. **Test in multiple browsers** (Chrome, Firefox, Safari)
3. **Test on mobile** (iOS Safari, Chrome Android)
4. **Monitor CDN status** - unpkg.com has occasional downtime
5. **Have fallback CDN** - prepare jsDelivr as backup
6. **Check CORS headers** - ensure CDN allows cross-origin

## Files to Check

```
✅ frontend/public/src/api/stacksAPI.js
   - NO import statements
   - NO export statements
   - Ends with: window.stacksAPI = stacksAPI;

✅ frontend/public/index.html
   - CDN URLs are .umd.js format
   - All scripts have defer attribute
   - stacksAPI.js script is NOT commented out
   - Correct path: src/api/stacksAPI.js

❌ frontend/public/src/blockchain/stacksAPI.js
   - OLD file - should be deleted or ignored
   - Don't use this path
```

## Next Steps

1. Follow "Quick Fix Checklist" above
2. Hard refresh page
3. Test wallet connection
4. If error persists, check "Complete Testing Procedure"
5. If still broken, check "Common Issues & Fixes"

Expected result after fix:
- ✅ No module errors
- ✅ Wallet dialog opens
- ✅ Connection completes
- ✅ Address saved to localStorage
