export const stellarConfig = {
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet",
  rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org",
  horizonUrl:
    process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ?? "https://horizon-testnet.stellar.org",
  passphrase:
    process.env.NEXT_PUBLIC_STELLAR_PASSPHRASE ?? "Test SDF Network ; September 2015",
  nftContractId: process.env.NEXT_PUBLIC_NFT_CONTRACT_ID ?? "",
  leaderboardContractId: process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_ID ?? "",
};

export function hasConfiguredContracts() {
  return Boolean(stellarConfig.nftContractId && stellarConfig.leaderboardContractId);
}
