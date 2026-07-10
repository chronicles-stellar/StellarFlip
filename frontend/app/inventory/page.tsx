import { InventoryPanel } from "@/components/inventory-panel";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Inventory</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">Your Soroban card vault</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Connected wallets can mint starter packs and load their owned NFT cards. Without contract IDs, the screen still presents a contributor-friendly demo preview.
        </p>
      </section>
      <InventoryPanel />
    </div>
  );
}
