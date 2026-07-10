export default function DeploymentPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/80">Deployment</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Suggested release flow</h2>
        <ol className="mt-6 space-y-4 text-slate-300">
          <li>1. Build and test Soroban contracts from the `contracts` workspace.</li>
          <li>2. Deploy `card-nft` and initialize it with the admin address plus base URI.</li>
          <li>3. Deploy `leaderboard` and initialize it with the admin address.</li>
          <li>4. Add contract IDs to `frontend/.env.local`.</li>
          <li>5. Verify Freighter wallet flows on testnet before mainnet rollout.</li>
          <li>6. Run frontend and docs builds, then deploy the Next.js apps.</li>
        </ol>
      </section>
    </div>
  );
}
