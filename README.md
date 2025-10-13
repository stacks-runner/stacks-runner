# 🌀 StacksRunner

**StacksRunner** is a blockchain-powered 2D maze game built on the **Stacks Blockchain**. Players navigate mazes to earn token rewards, gain XP, and unlock NFT passkeys as they advance through levels.

---

## 🎯 Project Overview

StacksRunner integrates gameplay with on-chain mechanics. Players earn rewards and interact with smart contracts written in **Clarity**, the Stacks smart contract language.

### Core Features
- 🧩 **Maze Challenges:** Players move through maze levels of increasing difficulty.
- 💰 **Token Rewards:** Players earn $RUN tokens for completing levels.
- 🧠 **XP System:** Players can purchase XP tokens to continue from failed points.
- 🎟️ **NFT Passkeys:** Upon reaching level 5, players receive an NFT passkey that unlocks exclusive game access.
- 🔒 **On-Chain Fairness:** Game logic and rewards are handled transparently via Clarity smart contracts.

---

## 🧱 Project Structure

```
StacksRunner/
│
├── contracts/               # Clarity smart contracts for game logic, NFTs, and XP tokens
│   ├── maze-game.clar       # Main game logic
│   ├── xp-token.clar        # XP token logic
│   ├── passkey-nft.clar     # NFT minting contract
│   └── tests/               # Clarinet test scripts
│
├── frontend/                # Simple 2D web interface for the game
│   ├── src/                 # React (or Svelte) source code
│   ├── assets/              # Game images, sprites, and sounds
│   ├── components/          # Reusable UI and gameplay components
│   └── package.json         # Frontend dependencies
│
├── docs/                    # Documentation and design resources
│   ├── architecture.md      # Project architecture overview
│   ├── gameflow.md          # Game logic and contract interactions
│   └── api-reference.md     # Smart contract APIs
│
├── scripts/                 # Deployment and setup scripts
│   ├── deploy-contracts.sh
│   ├── generate-wallets.sh
│   └── seed-tokens.sh
│
└── README.md                # General project information
```

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<organization>/stacksrunner.git
cd stacksrunner
```

### 2️⃣ Set Up the Smart Contracts
Install [Clarinet](https://github.com/hirosystems/clarinet):
```bash
clarinet integrate
clarinet test
```

### 3️⃣ Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Blockchain** | Stacks Blockchain |
| **Smart Contract Language** | Clarity |
| **Frontend Framework** | React or Svelte |
| **Token Standards** | SIP-010 (Fungible Token), SIP-009 (NFT) |
| **Dev Tools** | Clarinet, Hiro Wallet, Stacks.js |

---

## 🧠 Contributors

| Name | Role | Description |
|------|------|--------------|
| Emmanuel Ogbu | Smart Contract Developer | Clarity contracts & blockchain logic |
| [Team Member 2] | Frontend Developer | Game interface & animations |
| [Team Member 3] | Game Designer | Maze design & user flow |
| [Team Member 4] | Project Manager | Coordination & testing |

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🌐 Links
- [Stacks Blockchain](https://stacks.co)
- [Clarity Language Docs](https://docs.stacks.co/write-smart-contracts)
- [Clarinet CLI](https://github.com/hirosystems/clarinet)
- [Stacks.js SDK](https://github.com/hirosystems/stacks.js)

---

**StacksRunner** — Play, Earn, and Level Up On-Chain 🎮