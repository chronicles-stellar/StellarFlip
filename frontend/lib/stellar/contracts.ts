import { Difficulty, InventoryCard, LeaderboardEntry } from "@/lib/game/types";
import { stellarConfig } from "@/lib/stellar/config";

function ensureContract(id: string, label: string) {
  if (!id) {
    throw new Error(`${label} is not configured.`);
  }
}

async function getSdk() {
  return (await import("@stellar/stellar-sdk")) as any;
}

async function getFreighter() {
  return (await import("@stellar/freighter-api")) as any;
}

function convertArg(sdk: any, value: string | number, type: "address" | "symbol" | "u32" | "string") {
  if (type === "address") {
    return sdk.Address.fromString(value).toScVal();
  }

  if (type === "symbol") {
    return sdk.nativeToScVal(value, { type: "symbol" });
  }

  if (type === "string") {
    return sdk.nativeToScVal(value, { type: "string" });
  }

  return sdk.nativeToScVal(value, { type: "u32" });
}

async function invokeContract<T>({
  contractId,
  method,
  args,
  source,
  sign,
}: {
  contractId: string;
  method: string;
  args: Array<{ value: string | number; type: "address" | "symbol" | "u32" | "string" }>;
  source: string;
  sign: boolean;
}): Promise<T> {
  const sdk = await getSdk();
  const server = new sdk.rpc.Server(stellarConfig.rpcUrl);
  const contract = new sdk.Contract(contractId);
  const account = await server.getAccount(source);

  let transaction = new sdk.TransactionBuilder(account, {
    fee: sdk.BASE_FEE,
    networkPassphrase: stellarConfig.passphrase,
  })
    .addOperation(contract.call(method, ...args.map((arg) => convertArg(sdk, arg.value, arg.type))))
    .setTimeout(30)
    .build();

  const simulation = await server.simulateTransaction(transaction);
  if (simulation.error) {
    throw new Error(simulation.error);
  }

  transaction = sdk.rpc.assembleTransaction(transaction, simulation).build();

  if (!sign) {
    const result = simulation.result?.retval ?? simulation.result?.results?.[0]?.xdr ?? simulation.retval;
    return sdk.scValToNative(result) as T;
  }

  const freighter = await getFreighter();
  const signed = await freighter.signTransaction(transaction.toXDR(), {
    address: source,
    networkPassphrase: stellarConfig.passphrase,
  });

  const signedXdr = signed?.signedTxXdr ?? signed;
  const signedTx = sdk.TransactionBuilder.fromXDR(signedXdr, stellarConfig.passphrase);
  const submitted = await server.sendTransaction(signedTx);

  if (submitted.errorResultXdr) {
    throw new Error("Transaction submission failed.");
  }

  return submitted.hash as T;
}

function normalizeInventoryCard(raw: any): InventoryCard {
  return {
    tokenId: Number(raw.token_id ?? raw.tokenId ?? 0),
    pairId: Number(raw.pair_id ?? raw.pairId ?? 0),
    name: String(raw.name ?? "Unknown Card"),
    glyph: String(raw.glyph ?? "✦"),
    rarity: raw.rarity === "rare" ? "rare" : "core",
    constellation: String(raw.constellation ?? "Unknown"),
    accent: raw.rarity === "rare" ? "from-fuchsia-500 to-indigo-500" : "from-cyan-500 to-sky-500",
  };
}

function normalizeLeaderboard(raw: any, difficulty: Difficulty): LeaderboardEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((entry) => ({
    player: String(entry.player ?? "Unknown"),
    score: Number(entry.score ?? 0),
    moves: Number(entry.moves ?? 0),
    elapsedSeconds: Number(entry.elapsed_secs ?? entry.elapsedSeconds ?? 0),
    submittedAt: new Date(Number(entry.submitted_at ?? Date.now() / 1000) * 1000).toISOString(),
    difficulty,
    source: "chain" as const,
  }));
}

export async function mintStarterPack(address: string, difficulty: Difficulty) {
  ensureContract(stellarConfig.nftContractId, "NFT contract");
  return invokeContract<string>({
    contractId: stellarConfig.nftContractId,
    method: "mint_starter_pack",
    args: [
      { value: address, type: "address" },
      { value: difficulty, type: "symbol" },
    ],
    source: address,
    sign: true,
  });
}

export async function fetchOwnedCards(address: string): Promise<InventoryCard[]> {
  ensureContract(stellarConfig.nftContractId, "NFT contract");
  const tokenIds = await invokeContract<any[]>({
    contractId: stellarConfig.nftContractId,
    method: "tokens_of_owner",
    args: [{ value: address, type: "address" }],
    source: address,
    sign: false,
  });

  const cards = await Promise.all(
    (tokenIds ?? []).map(async (tokenId) => {
      const metadata = await invokeContract<any>({
        contractId: stellarConfig.nftContractId,
        method: "get_token",
        args: [{ value: Number(tokenId), type: "u32" }],
        source: address,
        sign: false,
      });

      return normalizeInventoryCard(metadata);
    }),
  );

  return cards;
}

export async function submitLeaderboardScore(
  address: string,
  input: {
    playerName: string;
    difficulty: Difficulty;
    score: number;
    moves: number;
    elapsedSeconds: number;
    challengeDay: number;
  },
) {
  ensureContract(stellarConfig.leaderboardContractId, "Leaderboard contract");

  return invokeContract<string>({
    contractId: stellarConfig.leaderboardContractId,
    method: "submit_score",
    args: [
      { value: address, type: "address" },
      { value: input.playerName, type: "string" },
      { value: input.difficulty, type: "symbol" },
      { value: input.score, type: "u32" },
      { value: input.moves, type: "u32" },
      { value: input.elapsedSeconds, type: "u32" },
      { value: input.challengeDay, type: "u32" },
    ],
    source: address,
    sign: true,
  });
}

export async function fetchLeaderboard(
  address: string,
  difficulty: Difficulty,
  challengeDay?: number,
): Promise<LeaderboardEntry[]> {
  ensureContract(stellarConfig.leaderboardContractId, "Leaderboard contract");

  const raw = challengeDay
    ? await invokeContract<any[]>({
        contractId: stellarConfig.leaderboardContractId,
        method: "get_daily_top_scores",
        args: [
          { value: difficulty, type: "symbol" },
          { value: challengeDay, type: "u32" },
        ],
        source: address,
        sign: false,
      })
    : await invokeContract<any[]>({
        contractId: stellarConfig.leaderboardContractId,
        method: "get_top_scores",
        args: [{ value: difficulty, type: "symbol" }],
        source: address,
        sign: false,
      });

  return normalizeLeaderboard(raw, difficulty);
}
