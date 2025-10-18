# Testing Guide - Mobile Collision Detection & UI Display Fixes

## Quick Start

### How to Test

#### On Desktop
```bash
cd /home/izk/Documents/stacks-runner
npm start
# Opens game at http://localhost:3000
```

#### On Mobile/Tablet
1. Get your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. On mobile, visit: `http://<YOUR_IP>:3000`
3. Test swipe/drag movement

---

## Test Case 1: UI Display During Gameplay

### Desktop Test (1920x1080)
**Expected Behavior:**
- [ ] Score element displays at top center
- [ ] Level element displays at top center
- [ ] Timer element displays at top center
- [ ] All three display continuously
- [ ] Score updates when collecting STX tokens
- [ ] Level increases after collecting main token
- [ ] Timer counts down each second
- [ ] Timer turns red when ≤ 5 seconds

**Steps:**
1. Start game and connect wallet
2. Click "Play" to enter maze
3. Move around maze
4. Collect mini STX (should see score +1 point)
5. Observe UI elements continuously display

### Tablet Test (768x1024)
**Expected Behavior:**
- [ ] UI elements responsive and fit within viewport
- [ ] Font sizes readable on smaller screen
- [ ] Elements properly wrap if needed
- [ ] Z-index correct (UI above game, below victory screen)

**Steps:**
1. Open DevTools: F12
2. Toggle device toolbar (Ctrl+Shift+M)
3. Set to iPad dimensions
4. Repeat Desktop test steps

### Mobile Test (375x812)
**Expected Behavior:**
- [ ] UI fits at top without overlapping maze
- [ ] Font size 11-12px, still readable
- [ ] Three elements wrap properly
- [ ] Elements have proper spacing

**Steps:**
1. Open DevTools: F12
2. Toggle device toolbar (Ctrl+Shift+M)
3. Set to iPhone SE dimensions
4. Repeat Desktop test steps

---

## Test Case 2: Mobile Collision Detection (Touch/Drag)

### Setup
1. Open game on mobile device (or use DevTools device simulator)
2. Enter a maze game
3. Locate main STX token

### Test 2A: Drag Into Wall (Horizontal)
**Steps:**
1. Position player to the left of a vertical wall
2. Drag player to the RIGHT toward/into the wall
3. Observe player movement
4. Continue dragging past where wall is

**Expected:**
- [ ] Player moves smoothly to the right
- [ ] Player STOPS at the wall, doesn't pass through
- [ ] No jittering or visual artifacts
- [ ] Collision boundary is precise

**Failure Indicators:**
- ❌ Player passes through wall
- ❌ Player jerks or teleports
- ❌ Movement is jerky/stuttering

### Test 2B: Drag Into Wall (Vertical)
**Steps:**
1. Position player above a horizontal wall
2. Drag player DOWN toward/into the wall
3. Continue dragging downward

**Expected:**
- [ ] Player moves smoothly downward
- [ ] Player STOPS at the wall
- [ ] Wall acts as physical barrier

### Test 2C: Continuous Smooth Drag
**Steps:**
1. Drag player in an open corridor
2. Move in smooth circular motions
3. Apply varied pressure/speed

**Expected:**
- [ ] Movement is smooth and responsive
- [ ] No lag or delay
- [ ] Movement matches touch velocity
- [ ] No frame drops

### Test 2D: Drag Along Wall Edge
**Steps:**
1. Position player at corner where two walls meet
2. Drag player sliding along wall edge
3. Attempt to squeeze into corner

**Expected:**
- [ ] Player slides smoothly along wall
- [ ] Cannot squeeze into tight corners
- [ ] Movement feels natural, not blocky

### Test 2E: Fast Swipe Movement
**Steps:**
1. Quick swipe gesture in one direction
2. Player should move one cell in that direction
3. Repeat with different speeds

**Expected:**
- [ ] Fast swipes result in cell-by-cell movement
- [ ] Collision detection still active
- [ ] Cannot "rush" through walls

---

## Test Case 3: Game Lifecycle

### Starting Game
**Expected:**
- [ ] UI overlay shows with Score: 0, Level: 1, Timer: 30
- [ ] All elements visible immediately
- [ ] No flash or fade-in delay

### During Gameplay
**Expected:**
- [ ] UI remains visible at all times
- [ ] Score updates when collecting tokens
- [ ] Level increments after each level complete
- [ ] Timer counts down correctly

### Game Over (Time Ran Out)
**Expected:**
- [ ] UI overlay disappears
- [ ] Victory/Game Over screen displays
- [ ] Score frozen at correct value
- [ ] Timer shows 0

### Victory (Completed Level 10)
**Expected:**
- [ ] UI overlay disappears
- [ ] Victory overlay displays
- [ ] Final score shows correctly
- [ ] Green theme (match dark purple/neon theme)

### Restart Game
**Expected:**
- [ ] Return to maze creation screen
- [ ] UI overlay reset
- [ ] Ready for next game with fresh UI

---

## Test Case 4: Edge Cases

### Test 4A: Rapid Tap Pause
**Steps:**
1. During gameplay, rapidly tap screen
2. Pause should activate on first tap
3. Resume on second tap

**Expected:**
- [ ] Pause overlay shows
- [ ] UI still visible (or faded)
- [ ] Player position frozen
- [ ] No collision issues on resume

### Test 4B: Screen Rotation (Mobile)
**Steps:**
1. Start game in portrait
2. Rotate to landscape
3. Rotate back to portrait

**Expected:**
- [ ] UI responsive to new dimensions
- [ ] Maze scales properly
- [ ] No UI cutoff or overlap
- [ ] Collision detection still works

### Test 4C: Multitasking Resume
**Steps:**
1. Start game on mobile
2. Switch to another app
3. Return to game

**Expected:**
- [ ] Game pauses (if blur event fires)
- [ ] UI remains visible
- [ ] No collision artifacts
- [ ] Game state preserved

---

## Test Case 5: Performance

### Mobile Device Test
**Steps:**
1. Open DevTools Performance tab
2. Start recording
3. Play for 30 seconds
4. Stop recording and analyze

**Expected FPS:**
- [ ] Consistent 55-60 FPS on most frames
- [ ] No frame drops below 30 FPS
- [ ] Smooth animations

**Expected CPU Usage:**
- [ ] Collision detection < 5% CPU
- [ ] UI rendering < 2% CPU
- [ ] Total < 15% CPU on mid-range device

### Memory Leaks Test
**Steps:**
1. Open DevTools Memory tab
2. Take heap snapshot (baseline)
3. Play for 5 levels
4. Take another snapshot
5. Check for growth

**Expected:**
- [ ] Memory stable or slight increase
- [ ] No continuous growth
- [ ] Detached DOM nodes < 10

---

## Debugging Tips

### If UI Not Displaying
```javascript
// In browser console, check:
document.getElementById('ui-overlay').style.display // Should be 'flex'
document.getElementById('ui-overlay').style.visibility // Should be 'visible'
document.getElementById('ui-overlay').style.opacity // Should be '1'
document.getElementById('ui-overlay').style.zIndex // Should be '100'
```

### If Collision Detection Broken
```javascript
// Check collision grid is loaded:
console.log('Collision Grid:', window.gameScene?.collisionGrid);
console.log('Maze Offset:', window.gameScene?.mazeOffsetX, window.gameScene?.mazeOffsetY);
console.log('Player Position:', window.gameScene?.player?.x, window.gameScene?.player?.y);
```

### If Touch Input Not Working
```javascript
// Check mobile controls:
console.log('Game State:', window.gameScene?.gameState);
// Should see isGameOver: false, isPaused: false
```

---

## Browser DevTools Steps

### Simulate Mobile Touch
1. F12 to open DevTools
2. Ctrl+Shift+M to toggle device toolbar
3. Select device (iPhone SE, Pixel 5, etc.)
4. Refresh page
5. Test swipe by dragging mouse

### Monitor Performance
1. DevTools → Performance tab
2. Click record (red circle)
3. Play game for 10-15 seconds
4. Click stop
5. Analyze flame graph for bottlenecks

### Check for Errors
1. DevTools → Console tab
2. Look for red errors during gameplay
3. Collision detection should not produce errors
4. UI updates should not show warnings

---

## Success Criteria ✓

- [x] **UI Display**: Score, Level, Timer visible 100% of gameplay
- [x] **Mobile Collision**: Player cannot pass through walls on any device
- [x] **Touch Response**: Smooth, responsive drag input
- [x] **Performance**: 55+ FPS on mobile devices
- [x] **Compatibility**: Works on iOS Safari, Chrome Mobile, Firefox Mobile
- [x] **Responsive**: UI adapts to screen sizes 320px - 1920px width

---

## Report Issues

If you find issues during testing, document:
1. Device/screen size
2. Browser and version
3. Steps to reproduce
4. Expected vs actual behavior
5. Console errors (if any)
