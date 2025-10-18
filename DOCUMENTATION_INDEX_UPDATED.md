# 📖 StacksRunner Documentation Index

## Quick Navigation

### 🚀 For First-Time Users
Start here if you're new to StacksRunner:
1. **[README.md](./README.md)** - Project overview & features
2. **[frontend/QUICK_START.md](./frontend/QUICK_START.md)** - How to start the game
3. **[WALLET_DEMO_MODE_GUIDE.md](./WALLET_DEMO_MODE_GUIDE.md)** - Understanding demo mode

### 🛠️ For Developers  
For fixing bugs or adding features:
1. **[WALLET_FIX_COMPLETE_v2.md](./WALLET_FIX_COMPLETE_v2.md)** - Technical implementation
2. **[VERIFICATION_CHECKLIST_FINAL.md](./VERIFICATION_CHECKLIST_FINAL.md)** - Code verification
3. **[WALLET_FIX_VISUAL_SUMMARY.md](./WALLET_FIX_VISUAL_SUMMARY.md)** - Architecture diagrams

### 🚢 For Deployment
When ready to go to production:
1. **[WALLET_DEMO_MODE_GUIDE.md](./WALLET_DEMO_MODE_GUIDE.md)** - See "For Production" section
2. **Smart contracts** in `contracts/` folder
3. Stacks testnet configuration

### ❓ For Troubleshooting
When something doesn't work:
1. **[frontend/QUICK_START.md](./frontend/QUICK_START.md)** - Common issues section
2. **[VERIFICATION_CHECKLIST_FINAL.md](./VERIFICATION_CHECKLIST_FINAL.md)** - Testing checklist
3. Browser console (F12) for error messages

---

## Full Document List

### Core Documentation

| Document | Purpose | Audience | Read Time |
|----------|---------|----------|-----------|
| [README.md](./README.md) | Project overview, features, structure | Everyone | 10 min |
| [WALLET_DEMO_MODE_GUIDE.md](./WALLET_DEMO_MODE_GUIDE.md) | Technical guide, demo mode details, production plan | Developers | 15 min |
| [frontend/QUICK_START.md](./frontend/QUICK_START.md) | Quick start guide, testing steps, debugging | Users & Testers | 5 min |

### Implementation Details

| Document | Purpose | Audience | Read Time |
|----------|---------|----------|-----------|
| [WALLET_FIX_COMPLETE_v2.md](./WALLET_FIX_COMPLETE_v2.md) | Complete fix summary, all changes made | Developers | 20 min |
| [WALLET_FIX_VISUAL_SUMMARY.md](./WALLET_FIX_VISUAL_SUMMARY.md) | Visual diagrams, architecture comparison | Developers, Designers | 10 min |
| [VERIFICATION_CHECKLIST_FINAL.md](./VERIFICATION_CHECKLIST_FINAL.md) | Comprehensive verification checklist | QA, Developers | 15 min |

### Legacy Documentation

| Document | Status | Purpose | Read If |
|----------|--------|---------|---------|
| [FIX_COMPLETE_SUMMARY.txt](./FIX_COMPLETE_SUMMARY.txt) | ✅ Kept for reference | Previous fix summary | Need historical context |
| [WALLET_CONNECTION_FIX.md](./WALLET_CONNECTION_FIX.md) | ✅ Kept for reference | Previous wallet implementation | Need old approach |
| [STACKS_LIBRARY_LOADER_SOLUTION.md](./STACKS_LIBRARY_LOADER_SOLUTION.md) | ✅ Kept for reference | Previous loader strategy | Need to understand what didn't work |

### Other Documentation

| Document | Purpose |
|----------|---------|
| Various `*.md` files | Previous iterations, fixes, features |

---

## How to Use This Index

### Find what you need:

**"I want to start playing StacksRunner"**
→ Go to: [frontend/QUICK_START.md](./frontend/QUICK_START.md)

**"I need to understand how the wallet works"**
→ Go to: [WALLET_DEMO_MODE_GUIDE.md](./WALLET_DEMO_MODE_GUIDE.md)

**"I need to debug an issue"**
→ Go to: [frontend/QUICK_START.md#debugging](./frontend/QUICK_START.md)

**"I need to deploy to production"**
→ Go to: [WALLET_DEMO_MODE_GUIDE.md#for-production](./WALLET_DEMO_MODE_GUIDE.md)

**"I want complete technical details"**
→ Go to: [WALLET_FIX_COMPLETE_v2.md](./WALLET_FIX_COMPLETE_v2.md)

**"I need to verify everything works"**
→ Go to: [VERIFICATION_CHECKLIST_FINAL.md](./VERIFICATION_CHECKLIST_FINAL.md)

**"I want to see architecture diagrams"**
→ Go to: [WALLET_FIX_VISUAL_SUMMARY.md](./WALLET_FIX_VISUAL_SUMMARY.md)

---

## Documentation Organization

```
StacksRunner/
├── README.md                              🌍 START HERE
├── WALLET_DEMO_MODE_GUIDE.md             📘 Main technical guide
├── WALLET_FIX_COMPLETE_v2.md             📗 Implementation details
├── WALLET_FIX_VISUAL_SUMMARY.md          📊 Diagrams & visuals
├── VERIFICATION_CHECKLIST_FINAL.md       ✅ Verification steps
├── frontend/
│   └── QUICK_START.md                    🚀 Quick start
└── Legacy docs (for reference)
    ├── FIX_COMPLETE_SUMMARY.txt
    ├── WALLET_CONNECTION_FIX.md
    ├── STACKS_LIBRARY_LOADER_SOLUTION.md
    └── Others...
```

---

## Key Topics Quick Links

### Wallet System
- [How wallet connection works](./WALLET_DEMO_MODE_GUIDE.md#how-it-works)
- [Wallet storage in localStorage](./WALLET_DEMO_MODE_GUIDE.md#demo-mode-current)
- [Production wallet setup](./WALLET_DEMO_MODE_GUIDE.md#for-production)

### Game Mechanics
- [Maze generation](./README.md#core-features)
- [Scoring system](./README.md#core-features)
- [Blockchain integration](./README.md#core-features)

### Development
- [Project structure](./README.md#project-structure)
- [File organization](./frontend/QUICK_START.md)
- [Debugging tools](./frontend/QUICK_START.md#debugging)

### Deployment
- [Demo mode to production](./WALLET_DEMO_MODE_GUIDE.md#for-production)
- [Production migration](./WALLET_DEMO_MODE_GUIDE.md#quick-migration-guide)
- [HTTPS setup](./WALLET_DEMO_MODE_GUIDE.md#for-production)

---

## Version History

| Version | Date | Status | Focus |
|---------|------|--------|-------|
| 2.0 | Oct 17, 2025 | ✅ Current | Demo mode (localStorage) |
| 1.9 | Oct 17, 2025 | ⚠️ Deprecated | Loader script (didn't work) |
| 1.8 | Oct 16, 2025 | ⚠️ Deprecated | CDN timeout issues |

**Current Version**: 2.0 (Demo Mode)  
**Status**: ✅ Production Ready for Testing

---

## Getting Help

### If you can't find what you're looking for:

1. **Check the main README** - [README.md](./README.md)
2. **Try the Quick Start** - [frontend/QUICK_START.md](./frontend/QUICK_START.md)
3. **Run browser console (F12)** - Look for error messages
4. **Review documentation** - Most common questions answered
5. **Check localhost console** - `npm start` output

### Common Questions Answered In:

| Question | Document |
|----------|----------|
| How do I start the game? | [QUICK_START.md](./frontend/QUICK_START.md) |
| How does wallet work? | [WALLET_DEMO_MODE_GUIDE.md](./WALLET_DEMO_MODE_GUIDE.md) |
| What changed in the fix? | [WALLET_FIX_COMPLETE_v2.md](./WALLET_FIX_COMPLETE_v2.md) |
| How do I debug issues? | [QUICK_START.md#debugging](./frontend/QUICK_START.md) |
| How do I deploy? | [WALLET_DEMO_MODE_GUIDE.md#for-production](./WALLET_DEMO_MODE_GUIDE.md) |
| Is the game working? | [VERIFICATION_CHECKLIST_FINAL.md](./VERIFICATION_CHECKLIST_FINAL.md) |

---

## Last Updated

**Date**: October 17, 2025  
**By**: GitHub Copilot  
**Status**: ✅ Current & Complete  

For latest updates, check:
- This index file
- [README.md](./README.md) header note
- [WALLET_DEMO_MODE_GUIDE.md](./WALLET_DEMO_MODE_GUIDE.md) version info

---

**Welcome to StacksRunner! 🎮**

Start with [README.md](./README.md) or jump straight to [frontend/QUICK_START.md](./frontend/QUICK_START.md)!

