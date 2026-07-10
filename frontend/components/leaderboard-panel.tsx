"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, Loader2, Orbit, Trophy } from "lucide-react";

import { useWallet } from "@/components/providers/wallet-provider";
import { Difficulty, LeaderboardEntry } from "@/lib/game/types";
import { formatTime, getDailyChallenge, maskAddress } from "@/lib/game/utils";
import { getLocalLeaderboard } from "@/lib/storage";
import { fetchLeaderboard } from "@/lib/stellar/contracts";
import { hasConfiguredContracts } from "@/lib/stellar/config";
import { cn } from "@/lib/utils";

export function LeaderboardPanel({ compact = false }: { compact?: boolean }) {
  const wallet = useWallet();
  const challenge = useMemo(() => getDailyChallenge(), []);
  const [difficulty, setDifficulty] = useState<Difficulty>(challenge.difficulty);
  const [scope, setScope] = useState<"global" | "daily">("daily");
  const [chainEntries, setChainEntries] = useState<LeaderboardEntry[]>([]);
  const [localEntries, setLocalEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setLocalEntries(getLocalLeaderboard(difficulty));
  }, [difficulty]);

  useEffect(() => {
    async function loadChainBoard() {
      if (!wallet.address || !hasConfiguredContracts()) {
        setChainEntries([]);
        return;
      }

      setIsLoading(true);
      setMessage(null);

      try {
        const next = await fetchLeaderboard(
          wallet.address,
          difficulty,
          scope === "daily" ? challenge.challengeDay : undefined,
        );
        setChainEntries(next);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load on-chain leaderboard.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadChainBoard();
  }, [wallet.address, difficulty, scope, challenge.challengeDay]);

  const localDisplay = compact ? localEntries.slice(0, 5) : localEntries;
  const chainDisplay = compact ? chainEntries.slice(0, 5) : chainEntries;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-fuchsia-300/15 bg-fuchsia-400/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-fuchsia-100/90">
            <Crown className="h-3.5 w-3.5" />
            Leaderboards
          </p>
          <h2 className="text-2xl font-semibold text-white">Race the galaxy</h2>
          <p className="mt-2 text-sm text-slate-300">
            Compare your local bests with Soroban-based rankings. Daily board resets every UTC day.
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm text-slate-200">
          {(["easy", "medium"] as Difficulty[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDifficulty(option)}
              className={cn(
                "rounded-full px-4 py-2 transition",
                difficulty === option ? "bg-white text-cosmic-950" : "hover:bg-white/5",
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm text-slate-200">
          {([
            ["daily", `Daily ${challenge.label}`],
            ["global", "Global"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setScope(value)}
              className={cn(
                "rounded-full px-4 py-2 transition",
                scope === value ? "bg-white text-cosmic-950" : "hover:bg-white/5",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {message ? (
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
          {message}
        </div>
      ) : null}

      <div className={cn("grid gap-4", compact ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2")}>
        <LeaderboardList
          title="On-chain"
          icon={<Orbit className="h-4 w-4" />}
          loading={isLoading}
          entries={chainDisplay}
          emptyLabel={wallet.address ? "No chain scores yet." : "Connect Freighter to load chain scores."}
        />
        <LeaderboardList
          title="Local best"
          icon={<Trophy className="h-4 w-4" />}
          loading={false}
          entries={localDisplay}
          emptyLabel="Play a round to create your first local score."
        />
      </div>
    </section>
  );
}

function LeaderboardList({
  title,
  icon,
  loading,
  entries,
  emptyLabel,
}: {
  title: string;
  icon: React.ReactNode;
  loading: boolean;
  entries: LeaderboardEntry[];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-cosmic-900/60 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
        {icon}
        {title}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-6 text-sm text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading scores...
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-3 py-6 text-sm text-slate-400">
          {emptyLabel}
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={`${entry.player}-${entry.score}-${entry.submittedAt}-${index}`}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-200"
            >
              <div>
                <p className="font-medium text-white">
                  #{index + 1} · {entry.source === "chain" ? maskAddress(entry.player) : entry.player}
                </p>
                <p className="text-xs text-slate-400">
                  {entry.moves} moves · {formatTime(entry.elapsedSeconds)}
                </p>
              </div>
              <span className="text-base font-semibold text-cyan-200">{entry.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
