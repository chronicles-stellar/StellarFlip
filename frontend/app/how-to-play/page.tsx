export default function HowToPlayPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl lg:col-span-2">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/80">How to play</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">A fast on-chain-friendly memory loop</h1>
        <ol className="mt-6 space-y-4 text-slate-300">
          <li>1. Connect Freighter if you want NFT minting and score submissions.</li>
          <li>2. Pick the daily challenge or switch into 4x4 or 6x6 practice mode.</li>
          <li>3. Flip two cards at a time and find all matching cosmic pairs.</li>
          <li>4. Keep your combo alive for better score gains.</li>
          <li>5. Submit your finished score to Soroban when the leaderboard contract is configured.</li>
        </ol>
      </section>
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-white">Scoring tips</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          <li>• Match quickly to stack combo bonuses.</li>
          <li>• Fewer moves means a better clear bonus.</li>
          <li>• Daily challenge uses the same seeded deck for everyone.</li>
          <li>• Medium mode rewards bigger bonuses but punishes slow clears.</li>
        </ul>
      </section>
    </div>
  );
}
