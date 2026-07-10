import { LeaderboardPanel } from "@/components/leaderboard-panel";

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-200/80">Leaderboard</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">Track the strongest runs</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Compare local practice sessions, daily challenge clears, and on-chain submissions when the Soroban leaderboard contract is deployed.
        </p>
      </section>
      <LeaderboardPanel />
    </div>
  );
}
