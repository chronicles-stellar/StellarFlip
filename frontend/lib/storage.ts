import { Difficulty, GameResult, LeaderboardEntry } from "@/lib/game/types";

const RESULTS_KEY = "stellar-flip.results";
const SOUND_KEY = "stellar-flip.sound";

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredResults(): GameResult[] {
  return safeRead<GameResult[]>(RESULTS_KEY, []);
}

export function saveGameResult(result: GameResult) {
  const next = [result, ...getStoredResults()]
    .sort((left, right) => right.score - left.score || left.elapsedSeconds - right.elapsedSeconds)
    .slice(0, 25);

  safeWrite(RESULTS_KEY, next);
}

export function getLocalLeaderboard(difficulty: Difficulty): LeaderboardEntry[] {
  return getStoredResults()
    .filter((entry) => entry.difficulty === difficulty)
    .sort((left, right) => right.score - left.score || left.elapsedSeconds - right.elapsedSeconds)
    .slice(0, 10)
    .map((entry, index) => ({
      player: index === 0 ? "You" : `Pilot ${index + 1}`,
      score: entry.score,
      moves: entry.moves,
      elapsedSeconds: entry.elapsedSeconds,
      submittedAt: entry.completedAt,
      difficulty: entry.difficulty,
      source: "local" as const,
    }));
}

export function getBestLocalScore(difficulty: Difficulty): number {
  return getStoredResults()
    .filter((entry) => entry.difficulty === difficulty)
    .reduce((best, entry) => Math.max(best, entry.score), 0);
}

export function isSoundEnabled(): boolean {
  return safeRead<boolean>(SOUND_KEY, true);
}

export function setSoundEnabled(enabled: boolean) {
  safeWrite(SOUND_KEY, enabled);
}
