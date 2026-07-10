"use client";

import { motion } from "framer-motion";
import { Gauge, RefreshCw, Rocket, TimerReset, Volume2, VolumeX, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GRID_BY_DIFFICULTY, PAIRS_BY_DIFFICULTY } from "@/lib/game/constants";
import { Difficulty, GameCard, GameResult, InventoryCard } from "@/lib/game/types";
import {
  calculateFinalBonus,
  calculateMatchScore,
  createDeck,
  formatTime,
  getDailyChallenge,
} from "@/lib/game/utils";
import { getBestLocalScore, isSoundEnabled, saveGameResult, setSoundEnabled } from "@/lib/storage";
import { cn } from "@/lib/utils";

type GameMode = "practice" | "daily";

type MemoryGameProps = {
  inventoryCards?: InventoryCard[];
  onGameComplete?: (result: GameResult) => void;
};

export function MemoryGame({ inventoryCards, onGameComplete }: MemoryGameProps) {
  const challenge = useMemo(() => getDailyChallenge(), []);
  const [mode, setMode] = useState<GameMode>("daily");
  const [difficulty, setDifficulty] = useState<Difficulty>(challenge.difficulty);
  const [seed, setSeed] = useState<number>(challenge.seed);
  const [cards, setCards] = useState<GameCard[]>(() => createDeck(challenge.difficulty, challenge.seed, inventoryCards));
  const [firstCardId, setFirstCardId] = useState<string | null>(null);
  const [secondCardId, setSecondCardId] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [combo, setCombo] = useState(0);
  const [liveScore, setLiveScore] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [soundEnabled, setSoundState] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);

  const bestLocalScore = useMemo(() => getBestLocalScore(difficulty), [difficulty, finalScore]);
  const displayScore = finalScore ?? liveScore;
  const progress = Math.min(100, Math.round((displayScore / challenge.targetScore) * 100));

  const playTone = useCallback((frequency: number, duration = 0.08) => {
    if (!soundEnabled || typeof window === "undefined") {
      return;
    }

    try {
      const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }

      const context = audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = context;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.02;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
    } catch {
      // Best-effort audio only.
    }
  }, [soundEnabled]);

  const resetBoard = useCallback(
    (nextMode: GameMode, nextDifficulty: Difficulty) => {
      const nextSeed = nextMode === "daily" ? challenge.seed : Date.now();
      setMode(nextMode);
      setDifficulty(nextDifficulty);
      setSeed(nextSeed);
      setCards(createDeck(nextDifficulty, nextSeed, inventoryCards));
      setFirstCardId(null);
      setSecondCardId(null);
      setMoves(0);
      setMatches(0);
      setCombo(0);
      setLiveScore(0);
      setFinalScore(null);
      setElapsedSeconds(0);
      setStarted(false);
      setCompleted(false);
      setLocked(false);
    },
    [challenge.seed, inventoryCards],
  );

  useEffect(() => {
    resetBoard(mode, difficulty);
  }, [inventoryCards, resetBoard]);

  useEffect(() => {
    setSoundState(isSoundEnabled());
  }, []);

  useEffect(() => {
    if (!started || completed) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [started, completed]);

  useEffect(() => {
    if (!firstCardId || !secondCardId) {
      return undefined;
    }

    setLocked(true);

    const firstCard = cards.find((card) => card.id === firstCardId);
    const secondCard = cards.find((card) => card.id === secondCardId);
    const isMatch = firstCard?.pairId === secondCard?.pairId;

    const timeout = window.setTimeout(() => {
      setCards((currentCards) =>
        currentCards.map((card) => {
          if (card.id !== firstCardId && card.id !== secondCardId) {
            return card;
          }

          if (isMatch) {
            return { ...card, matched: true, flipped: true };
          }

          return { ...card, flipped: false };
        }),
      );

      if (isMatch) {
        setMatches((current) => current + 1);
        setCombo((current) => {
          const nextCombo = current + 1;
          setLiveScore((score) => score + calculateMatchScore(difficulty, nextCombo, elapsedSeconds));
          return nextCombo;
        });
        playTone(880, 0.12);
      } else {
        setCombo(0);
        setLiveScore((score) => Math.max(0, score - 12));
        playTone(220, 0.12);
      }

      setFirstCardId(null);
      setSecondCardId(null);
      setLocked(false);
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [firstCardId, secondCardId, cards, difficulty, elapsedSeconds, playTone]);

  useEffect(() => {
    if (!started || completed || cards.length === 0 || !cards.every((card) => card.matched)) {
      return;
    }

    const total = liveScore + calculateFinalBonus(difficulty, moves, elapsedSeconds);
    const result: GameResult = {
      difficulty,
      score: total,
      moves,
      elapsedSeconds,
      challengeDay: challenge.challengeDay,
      completedAt: new Date().toISOString(),
      mode,
    };

    setCompleted(true);
    setFinalScore(total);
    saveGameResult(result);
    onGameComplete?.(result);
    playTone(1046, 0.18);
  }, [
    cards,
    started,
    completed,
    liveScore,
    difficulty,
    moves,
    elapsedSeconds,
    challenge.challengeDay,
    mode,
    onGameComplete,
    playTone,
  ]);

  function handleFlip(cardId: string) {
    if (locked || completed) {
      return;
    }

    const card = cards.find((current) => current.id === cardId);
    if (!card || card.flipped || card.matched) {
      return;
    }

    playTone(520, 0.06);
    if (!started) {
      setStarted(true);
    }

    setCards((currentCards) =>
      currentCards.map((currentCard) =>
        currentCard.id === cardId ? { ...currentCard, flipped: true } : currentCard,
      ),
    );

    if (!firstCardId) {
      setFirstCardId(cardId);
      return;
    }

    if (firstCardId === cardId || secondCardId) {
      return;
    }

    setSecondCardId(cardId);
    setMoves((current) => current + 1);
  }

  function handleToggleSound() {
    const next = !soundEnabled;
    setSoundState(next);
    setSoundEnabled(next);
  }

  const gridClass = difficulty === "easy" ? "grid-cols-4" : "grid-cols-6";
  const remainingPairs = PAIRS_BY_DIFFICULTY[difficulty] - matches;
  const challengeDifficultyLabel = challenge.difficulty === "easy" ? "4x4" : "6x6";

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl lg:p-6">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-100/90">
            <Rocket className="h-3.5 w-3.5" />
            Game board
          </p>
          <h2 className="text-2xl font-semibold text-white">Flip, match, and submit your best run</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Practice any board size or jump into the deterministic daily challenge shared across every player.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => resetBoard("daily", challenge.difficulty)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              mode === "daily"
                ? "bg-white text-cosmic-950"
                : "border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10",
            )}
          >
            Daily challenge · {challengeDifficultyLabel}
          </button>
          {(["easy", "medium"] as Difficulty[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => resetBoard("practice", option)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                mode === "practice" && difficulty === option
                  ? "bg-white text-cosmic-950"
                  : "border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10",
              )}
            >
              Practice {option === "easy" ? "4x4" : "6x6"}
            </button>
          ))}
          <button
            type="button"
            onClick={handleToggleSound}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            Sound {soundEnabled ? "on" : "off"}
          </button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={<Gauge className="h-4 w-4" />} label="Score" value={displayScore.toString()} />
        <StatCard icon={<Zap className="h-4 w-4" />} label="Combo" value={`x${combo}`} />
        <StatCard icon={<TimerReset className="h-4 w-4" />} label="Time" value={formatTime(elapsedSeconds)} />
        <StatCard icon={<RefreshCw className="h-4 w-4" />} label="Moves" value={moves.toString()} />
        <StatCard icon={<Rocket className="h-4 w-4" />} label="Remaining" value={remainingPairs.toString()} />
      </div>

      <div className="mb-6 rounded-3xl border border-white/10 bg-cosmic-900/70 p-4">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
          <span>
            {mode === "daily" ? `Daily challenge · ${challenge.label}` : `${difficulty === "easy" ? "4x4" : "6x6"} practice`}
          </span>
          <span>Best local: {bestLocalScore}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-cosmic-400 to-fuchsia-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className={cn("grid gap-2 rounded-[2rem] bg-cosmic-950/50 p-3 sm:gap-3 sm:p-4", gridClass)}>
        {cards.map((card) => (
          <FlipCard
            key={card.id}
            card={card}
            compact={difficulty === "medium"}
            columns={GRID_BY_DIFFICULTY[difficulty]}
            onFlip={() => handleFlip(card.id)}
          />
        ))}
      </div>

      {completed ? (
        <div className="mt-5 rounded-3xl border border-emerald-300/15 bg-emerald-400/10 p-5 text-sm text-emerald-50">
          <p className="text-lg font-semibold">Board cleared.</p>
          <p className="mt-2">
            Final score: <span className="font-bold text-white">{displayScore}</span> · {moves} moves · {formatTime(elapsedSeconds)}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-cosmic-900/70 p-4">
      <div className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function FlipCard({
  card,
  columns,
  compact,
  onFlip,
}: {
  card: GameCard;
  columns: number;
  compact: boolean;
  onFlip: () => void;
}) {
  const minHeight = columns === 4 ? "min-h-[96px] sm:min-h-[120px]" : "min-h-[68px] sm:min-h-[86px]";

  return (
    <button type="button" onClick={onFlip} className={cn("group [perspective:1000px]", minHeight)}>
      <motion.div
        animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        className="relative h-full w-full rounded-3xl [transform-style:preserve-3d]"
      >
        <div className="absolute inset-0 flex h-full items-center justify-center rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cosmic-900 to-cosmic-800 text-2xl text-cyan-200 shadow-inner [backface-visibility:hidden] sm:text-3xl">
          <span className="opacity-80">✧</span>
        </div>
        <div
          className={cn(
            "absolute inset-0 flex h-full flex-col justify-between rounded-3xl border border-white/15 bg-gradient-to-br p-3 text-left text-white [backface-visibility:hidden] [transform:rotateY(180deg)]",
            compact ? "text-[11px]" : "text-xs",
            card.accent,
            card.matched ? "ring-2 ring-emerald-300/50" : "",
          )}
        >
          <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.18em] text-white/80">
            <span>{card.constellation}</span>
            <span>{card.rarity}</span>
          </div>
          <div className="flex flex-1 items-center justify-center text-3xl sm:text-4xl">{card.glyph}</div>
          <div>
            <p className="font-semibold leading-tight">{card.name}</p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-white/70">Pair #{card.pairId + 1}</p>
          </div>
        </div>
      </motion.div>
    </button>
  );
}
