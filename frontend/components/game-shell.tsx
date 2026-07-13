"use client";

import { useState } from "react";
import { ArrowUpRight, Flag, Rocket, Trophy } from "lucide-react";

import { LeaderboardPanel } from "@/components/leaderboard-panel";
import { MemoryGame } from "@/components/memory-game";
import { InventoryPanel } from "@/components/inventory-panel";
import { useWallet } from "@/components/providers/wallet-provider";
import { Difficulty, GameResult } from "@/lib/game/types";
import { PLAYER_NAME_MAX_LENGTH, sanitizePlayerName, validatePlayerName } from "@/lib/game/sanitize";
import { submitLeaderboardScore } from "@/lib/stellar/contracts";
import { hasConfiguredContracts } from "@/lib/stellar/config";

export function GameShell() {
  const wallet = useWallet();
  const [latestResult, setLatestResult] = useState<GameResult | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Raw value typed by the user — sanitized before use. */
  const [playerNameRaw, setPlayerNameRaw] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const sanitized = sanitizePlayerName(e.target.value);
    setPlayerNameRaw(sanitized);
    // Clear previous error as the user edits.
    setNameError(null);
  }

  async function handleSubmit(result: GameResult) {
    if (!wallet.address) {
      setSubmitStatus("Connect Freighter to send your score on-chain.");
      return;
    }

    if (!hasConfiguredContracts()) {
      setSubmitStatus("Add deployed leaderboard contract IDs to enable score submissions.");
      return;
    }

    // Sanitize once more at submission time (belt-and-suspenders).
    const playerName = sanitizePlayerName(playerNameRaw);
    const validationError = validatePlayerName(playerName);
    if (validationError) {
      setNameError(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setNameError(null);

    try {
      await submitLeaderboardScore(wallet.address, {
        playerName,
        difficulty: result.difficulty,
        score: result.score,
        moves: result.moves,
        elapsedSeconds: result.elapsedSeconds,
        challengeDay: result.mode === "daily" ? result.challengeDay : 0,
      });
      setSubmitStatus("Score submitted on-chain.");
    } catch (error) {
      setSubmitStatus(error instanceof Error ? error.message : "Score submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-cyan-100/90">
            <Rocket className="h-3.5 w-3.5" />
            Web3 memory match
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
            A polished Stellar game loop with Soroban NFTs and on-chain score chasing.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Stellar Flip is a grant-ready MVP: familiar gameplay, cosmic presentation, and wallet-native progression.
            Mint your starter pack, clear the board, and push your name onto the leaderboard.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <FeaturePill label="4x4 and 6x6 boards" />
            <FeaturePill label="Freighter wallet" />
            <FeaturePill label="Soroban NFTs" />
            <FeaturePill label="Daily challenge" />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cosmic-900 via-cosmic-800 to-cosmic-950 p-6 shadow-glow">
            <div className="flex items-center gap-2 text-cyan-200">
              <Flag className="h-4 w-4" />
              <span className="text-sm font-medium uppercase tracking-[0.28em]">Latest run</span>
            </div>
            {latestResult ? (
              <div className="mt-4 space-y-3 text-slate-100">
                <p className="text-3xl font-semibold">{latestResult.score}</p>
                <p className="text-sm text-slate-300">
                  {latestResult.difficulty === "easy" ? "Easy" : "Medium"} · {latestResult.moves} moves · {latestResult.elapsedSeconds}s
                </p>

                {/* Player name input — sanitized client-side before submission */}
                <div className="space-y-1">
                  <label htmlFor="player-name" className="block text-xs uppercase tracking-[0.2em] text-slate-400">
                    Display name
                  </label>
                  <input
                    id="player-name"
                    type="text"
                    value={playerNameRaw}
                    onChange={handleNameChange}
                    maxLength={PLAYER_NAME_MAX_LENGTH}
                    placeholder="Pilot name…"
                    aria-describedby={nameError ? "player-name-error" : undefined}
                    aria-invalid={nameError !== null}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
                  />
                  <p className="text-right text-[10px] text-slate-500">
                    {playerNameRaw.length}/{PLAYER_NAME_MAX_LENGTH}
                  </p>
                  {nameError ? (
                    <p id="player-name-error" role="alert" className="text-xs text-red-400">
                      {nameError}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => void handleSubmit(latestResult)}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-cosmic-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit on-chain"}
                </button>
                {submitStatus ? <p className="text-sm text-cyan-200">{submitStatus}</p> : null}
              </div>
            ) : (
              <div className="mt-4 text-sm text-slate-300">
                Finish a round to unlock chain submission.
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
            <div className="flex items-center gap-2 text-fuchsia-200">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-medium uppercase tracking-[0.28em]">Contributor-friendly MVP</span>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>Clean monorepo structure for frontend, contracts, and docs</li>
              <li>Local fallback mode for demo-friendly development</li>
              <li>Issue templates and MIT licensing for open contribution</li>
            </ul>
          </div>
        </div>
      </section>

      <MemoryGame onGameComplete={setLatestResult} />

      <section className="grid gap-6 xl:grid-cols-2">
        <InventoryPanel compact={false} />
        <LeaderboardPanel compact={false} />
      </section>
    </div>
  );
}

function FeaturePill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100">
      {label}
    </span>
  );
}
