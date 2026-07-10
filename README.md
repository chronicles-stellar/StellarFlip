# Stellar Flip

Stellar Flip is a polished Web3 memory match game built for the Stellar ecosystem. It combines classic flip-card gameplay with Soroban-powered NFTs, on-chain high scores, and Freighter wallet support.

## Vision

This project is designed as an open-source MVP for contributors, hackathons, and GrantFox bounties. The goal is to showcase how casual on-chain gaming can feel approachable, fun, and visually polished on Stellar.

## Monorepo Structure

```text
stellar-flip/
├── frontend/                 # Next.js 14 App Router game client
├── contracts/                # Soroban smart contracts (NFT + leaderboard)
├── docs/                     # Documentation site
├── .github/                  # Issue templates and community files
├── LICENSE                   # MIT license
├── package.json              # Workspace scripts
├── pnpm-workspace.yaml       # Workspace definition
└── README.md                 # Project overview and setup
```

## Features

### Gameplay
- Classic memory match gameplay with 4x4 and 6x6 boards
- Cosmic-themed card art, gradients, and motion
- Flip animations, timer, combo scoring, and replay flow
- Daily challenge rotation with deterministic seeded decks
- Local high score persistence for offline/demo mode

### Web3
- Soroban NFT starter-pack minting
- On-chain collectible inventory lookup
- On-chain leaderboard submissions
- Freighter wallet integration for connect and signing
- Network-aware Stellar RPC configuration

## Tech Stack

### Frontend
- Next.js 14+
- TypeScript
- Tailwind CSS
- Framer Motion
- Stellar SDK
- Freighter API

### Contracts
- Rust
- Soroban SDK

### Documentation
- Next.js static documentation site

## Quick Start

### 1. Prerequisites
- Node.js 20+
- pnpm 9+
- Rust stable
- `wasm32-unknown-unknown` target
- Soroban CLI
- Freighter wallet extension

> Tip: this repository includes [.nvmrc](.nvmrc) and supports `npm install` through workspaces if `pnpm` is not available.

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start the game client

```bash
pnpm dev:frontend
```

### 4. Start the docs site

```bash
pnpm dev:docs
```

## Environment Variables

Copy [frontend/.env.example](frontend/.env.example) to `frontend/.env.local`.

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` or `mainnet` |
| `NEXT_PUBLIC_STELLAR_RPC_URL` | Soroban RPC endpoint |
| `NEXT_PUBLIC_STELLAR_HORIZON_URL` | Horizon endpoint |
| `NEXT_PUBLIC_STELLAR_PASSPHRASE` | Network passphrase |
| `NEXT_PUBLIC_NFT_CONTRACT_ID` | Deployed NFT contract address |
| `NEXT_PUBLIC_LEADERBOARD_CONTRACT_ID` | Deployed leaderboard contract address |

## Contract Development

From [contracts](contracts):

```bash
cd contracts
cargo test
cargo build --target wasm32-unknown-unknown --release
```

Recommended deployment flow:
1. Build each contract to WASM.
2. Deploy with Soroban CLI.
3. Initialize the NFT contract with an admin address and base URI.
4. Initialize the leaderboard contract with an admin address.
5. Add deployed contract IDs to `frontend/.env.local`.

## Frontend Development Notes

- The app supports a polished local demo mode when contracts are not yet deployed.
- Wallet-based inventory and leaderboard actions become active automatically once the environment variables are configured.
- Daily challenges are generated from the current UTC date for deterministic global play.

## Documentation Site

The docs site lives in [docs](docs) and covers:
- local setup
- contract architecture
- wallet flow
- contributor guidance
- GrantFox-friendly starter issues

## Community and Contribution

### Good First Issues
1. Add sound effect toggles and volume controls
2. Add more cosmic card skins and rarity tiers
3. Add multiplayer challenge invites
4. Improve on-chain leaderboard pagination
5. Add localization for daily challenge labels

### Contribution Workflow
1. Fork the repository
2. Create a feature branch
3. Run linting and type checks
4. Open a pull request using the templates in [.github](.github)

## Deployment Checklist

- [ ] Deploy `stellar_flip_cards` contract
- [ ] Deploy `stellar_flip_leaderboard` contract
- [ ] Configure frontend environment variables
- [ ] Verify Freighter on testnet
- [ ] Submit and retrieve a leaderboard score
- [ ] Mint a starter pack and verify inventory rendering

## License

Released under the MIT License. See [LICENSE](LICENSE).
