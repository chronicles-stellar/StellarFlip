export type Difficulty = "easy" | "medium";

export type CardRarity = "core" | "rare";

export type CardTemplate = {
  pairId: number;
  name: string;
  glyph: string;
  accent: string;
  rarity: CardRarity;
  constellation: string;
};

export type GameCard = CardTemplate & {
  id: string;
  matched: boolean;
  flipped: boolean;
};

export type GameResult = {
  difficulty: Difficulty;
  score: number;
  moves: number;
  elapsedSeconds: number;
  challengeDay: number;
  completedAt: string;
  mode: "daily" | "practice";
};

export type LeaderboardEntry = {
  player: string;
  score: number;
  moves: number;
  elapsedSeconds: number;
  submittedAt: string;
  difficulty: Difficulty;
  source: "local" | "chain";
};

export type InventoryCard = CardTemplate & {
  tokenId: number;
};

export type DailyChallenge = {
  label: string;
  challengeDay: number;
  seed: number;
  difficulty: Difficulty;
  targetScore: number;
};
