

```
# 🌀 StacksRunner

**StacksRunner** is a 2D blockchain-based maze game built on the **Stacks blockchain**.  
Players navigate through maze levels, earn on-chain rewards, and collect NFTs as progress badges.  
The project combines **Clarity smart contracts** for game logic and **React + Vite** for the interactive frontend experience.

---

## 🎯 Core Concept

Players start at Level 1 and progress through increasingly challenging mazes.  
At key milestones:
- 🪙 **Earn XP Tokens** – used to continue from failed points or unlock special abilities.  
- 🎖️ **Mint MazePass NFTs** – awarded at Level 5 as a **pass key** to advanced levels.  

---

## 🧱 Project Structure

```

stacksrunner/
│
├── contracts/                      # Clarity smart contracts (game, XP token, NFT)
│   ├── MazeGame.clar
│   ├── MazePassNFT.clar
│   ├── MazeXPToken.clar
│   ├── tests/                      # Clarinet test files
│   └── Clarinet.toml
│
├── web/                            # Frontend (2D game built with React + Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── game/
│   │   ├── blockchain/             # Stacks.js integrations
│   │   └── App.jsx
│   ├── public/
│   └── package.json
│
├── docs/                           # Documentation and design notes
│   ├── GAME_FLOW.md
│   ├── CONTRACT_ARCHITECTURE.md
│   ├── FRONTEND_INTEGRATION.md
│   └── ROADMAP.md
│
└── README.md                       # You're here!

````

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Smart Contracts | **Clarity** (Stacks blockchain) |
| Local Dev | **Clarinet** |
| Frontend | **React + Vite** |
| Blockchain Connection | **Stacks.js** |
| Package Manager | **npm** |
| Version Control | **GitHub (StacksRunner org)** |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/stacksrunner/stacksrunner.git
cd stacksrunner
````

---

### 2. Smart Contract Setup

```bash
cd contracts
clarinet test
clarinet console
```

🧩 *Clarinet* runs local simulations and helps you test contract functions interactively.

---

### 3. Frontend Setup

```bash
cd web
npm install
npm run dev
```

The app will run on [http://localhost:5173](http://localhost:5173).

---

### 4. Folder Roles

| Folder       | Role                                          |
| ------------ | --------------------------------------------- |
| `contracts/` | Blockchain logic — rewards, XP, NFTs          |
| `web/`       | 2D maze interface + player UI                 |
| `docs/`      | Project documentation for devs and team leads |

---

## 🧩 Game Logic Highlights

* **Progress System:** Tracks each player’s maze level and completion.
* **XP Tokens:** Players can purchase or earn tokens to continue gameplay.
* **NFT Pass:** Auto-mints once a player reaches level 5, unlocking premium levels.
* **Anti-Cheat Logic:** Progress submission verified on-chain.

---

## 🔐 Security & Access

* Only the **MazeGame** contract can mint NFTs.
* XP token transfers are validated before gameplay continuation.
* Sensitive operations use Clarity’s `as-contract` for safety.

---

## 🤝 Contributing

We welcome community contributions!

**Steps to Contribute:**

1. Fork the repo
2. Create a feature branch

   ```bash
   git checkout -b feat/add-nft-ui
   ```
3. Commit and push changes

   ```bash
   git commit -m "feat: added NFT mint button"
   git push origin feat/add-nft-ui
   ```
4. Submit a Pull Request

Check `/docs/CONTRIBUTING.md` for team conventions.

---

## 🗺️ Roadmap (v1 → v2)

| Phase | Focus                               |
| ----- | ----------------------------------- |
| v1.0  | Core Maze Logic + XP Token          |
| v1.1  | NFT Pass Integration                |
| v1.2  | UI Enhancements & Leaderboard       |
| v2.0  | Multiplayer + On-chain Achievements |

---

## 🪙 License

This project is licensed under the **MIT License**.
Feel free to use, modify, and build upon it.

---

### 🌐 Links

* [Stacks Documentation](https://docs.stacks.co)
* [Clarinet Docs](https://docs.hiro.so/clarinet)
* [Stacks.js Library](https://docs.hiro.so/build-apps/stackjs)

```
