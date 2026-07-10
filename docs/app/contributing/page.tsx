const issues = [
  "Add accessibility improvements for color-blind card palettes",
  "Add richer NFT metadata previews in the inventory view",
  "Add leaderboard pagination and wallet profile badges",
  "Add challenge streak tracking",
  "Add multilingual docs and UI copy",
];

export default function ContributingPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Contributing</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Make Stellar Flip better</h2>
        <p className="mt-4 text-slate-300">
          This repository is structured for approachable open-source work. Contributors can focus on UI polish, Soroban upgrades, testing, docs, or community tooling.
        </p>
        <ul className="mt-6 space-y-3 text-slate-300">
          <li>• Open an issue or claim a Good First Issue.</li>
          <li>• Build in a feature branch.</li>
          <li>• Keep changes small and well-documented.</li>
          <li>• Update docs when behavior changes.</li>
        </ul>
      </section>
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
        <h3 className="text-xl font-semibold text-white">Good First Issues</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          {issues.map((issue) => (
            <li key={issue}>• {issue}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
