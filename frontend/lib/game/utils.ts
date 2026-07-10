import { BASE_DECK, DAILY_TARGETS, PAIRS_BY_DIFFICULTY } from "@/lib/game/constants";
import { CardTemplate, DailyChallenge, Difficulty, GameCard, InventoryCard } from "@/lib/game/types";

function mulberry32(seed: number) {
  return function random() {
    let next = (seed += 0x6d2b79f5);
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  const random = mulberry32(seed);

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

export function getDeckTemplates(
  difficulty: Difficulty,
  inventoryCards?: InventoryCard[],
): CardTemplate[] {
  const pairCount = PAIRS_BY_DIFFICULTY[difficulty];
  const fromInventory =
    inventoryCards
      ?.map(({ tokenId: _tokenId, ...template }) => template)
      .filter((template, index, array) => array.findIndex((item) => item.pairId === template.pairId) === index) ?? [];

  const pool = fromInventory.length >= pairCount ? fromInventory : BASE_DECK;
  return pool.slice(0, pairCount);
}

export function createDeck(
  difficulty: Difficulty,
  seed: number,
  inventoryCards?: InventoryCard[],
): GameCard[] {
  const templates = getDeckTemplates(difficulty, inventoryCards);
  const deck = templates.flatMap((template) => {
    return [0, 1].map((copyIndex) => ({
      ...template,
      id: `${template.pairId}-${copyIndex}-${seed}`,
      matched: false,
      flipped: false,
    }));
  });

  return seededShuffle(deck, seed + deck.length);
}

export function getDailyChallenge(date = new Date()): DailyChallenge {
  const utcYear = date.getUTCFullYear();
  const utcMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const utcDay = String(date.getUTCDate()).padStart(2, "0");
  const challengeDay = Number(`${utcYear}${utcMonth}${utcDay}`);
  const difficulty: Difficulty = challengeDay % 2 === 0 ? "medium" : "easy";

  return {
    label: `${utcYear}-${utcMonth}-${utcDay} UTC`,
    challengeDay,
    seed: challengeDay,
    difficulty,
    targetScore: DAILY_TARGETS[difficulty],
  };
}

export function calculateMatchScore(
  difficulty: Difficulty,
  combo: number,
  elapsedSeconds: number,
): number {
  const difficultyBonus = difficulty === "medium" ? 120 : 70;
  const comboBonus = combo * 18;
  const speedBonus = Math.max(0, 40 - Math.floor(elapsedSeconds / 5));
  return difficultyBonus + comboBonus + speedBonus;
}

export function calculateFinalBonus(
  difficulty: Difficulty,
  moves: number,
  elapsedSeconds: number,
): number {
  const efficiencyBonus = Math.max(0, difficulty === "easy" ? 220 - moves * 6 : 520 - moves * 8);
  const timeBonus = Math.max(0, difficulty === "easy" ? 240 - elapsedSeconds * 4 : 480 - elapsedSeconds * 5);
  return efficiencyBonus + timeBonus;
}

export function maskAddress(address: string) {
  if (address.length < 10) {
    return address;
  }

  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}
