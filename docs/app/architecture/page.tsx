const sections = [
  {
    title: "Monorepo shape",
    body: "The repository is split into frontend, contracts, and docs so contributors can work on gameplay, smart contracts, or documentation independently.",
  },
  {
    title: "Gameplay loop",
    body: "The frontend creates deterministic boards for daily challenge mode and random boards for practice mode. Local high scores are stored in the browser to keep the MVP playable before deployment.",
  },
  {
    title: "Wallet and contracts",
    body: "Freighter is used for authentication and transaction signing. Soroban contracts expose starter-pack minting, inventory lookup, and leaderboard writes.",
  },
  {
    title: "Progressive enhancement",
    body: "If contract IDs are missing, the app stays usable in demo mode. Once deployed IDs are provided, minting and score submission automatically turn on.",
  },
];

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-200/80">Architecture</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">System design</h2>
        <p className="mt-4 text-slate-300">
          The MVP is intentionally modular so gameplay polish and Stellar integration can evolve independently.
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <section key={section.title} className="rounded-3xl border border-white/10 bg-cosmic-900/60 p-5">
            <h3 className="text-xl font-semibold text-white">{section.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
