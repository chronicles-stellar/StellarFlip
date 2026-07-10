export default function DocsHomePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Overview</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">A contributor-friendly Stellar gaming MVP</h2>
        <p className="mt-4 text-slate-300">
          Stellar Flip demonstrates how a casual memory game can connect wallet UX, NFT ownership, and on-chain leaderboards without overwhelming contributors.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <DocCard title="Frontend" text="Next.js App Router client with responsive UI, local demo mode, wallet connection, and polished game flow." />
          <DocCard title="Contracts" text="Soroban contracts for collectible card minting and leaderboard submissions." />
          <DocCard title="Docs" text="Static docs app covering setup, deployment, architecture, and contribution workflow." />
          <DocCard title="GrantFox" text="Designed with clear issue templates and approachable work items for bounty contributors." />
        </div>
      </section>
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
        <h3 className="text-xl font-semibold text-white">Quick links</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          <li>• Install dependencies with `pnpm install`</li>
          <li>• Run the game with `pnpm dev:frontend`</li>
          <li>• Run the docs site with `pnpm dev:docs`</li>
          <li>• Build contracts from the `contracts` workspace</li>
        </ul>
      </section>
    </div>
  );
}

function DocCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-cosmic-900/60 p-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{text}</p>
    </div>
  );
}
