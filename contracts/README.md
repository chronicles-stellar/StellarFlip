# Stellar Flip Soroban Contracts

This workspace contains the two on-chain building blocks for Stellar Flip:

- `card-nft`: mints collectible starter-pack cards and exposes inventory reads
- `leaderboard`: stores best scores and daily challenge rankings

## Layout

```text
contracts/
├── card-nft/
│   ├── Cargo.toml
│   └── src/lib.rs
├── leaderboard/
│   ├── Cargo.toml
│   └── src/lib.rs
└── Cargo.toml
```

## Commands

```bash
cargo test
cargo build --target wasm32-unknown-unknown --release
```

## Suggested Deployment Order

1. Deploy `card-nft`
2. Run `initialize(admin, base_uri)`
3. Deploy `leaderboard`
4. Run `initialize(admin)`
5. Set the contract IDs in [frontend/.env.example](../frontend/.env.example)

## Contract Notes

### NFT Contract
- Stores starter-pack collectibles by owner address
- Supports inventory reads and metadata lookup
- Emits mint and transfer events

### Leaderboard Contract
- Tracks per-difficulty best scores
- Maintains top-10 global boards
- Maintains top-10 daily boards keyed by UTC challenge ID
