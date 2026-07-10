"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, Loader2, Sparkles, Stars } from "lucide-react";

import { useWallet } from "@/components/providers/wallet-provider";
import { BASE_DECK } from "@/lib/game/constants";
import { Difficulty, InventoryCard } from "@/lib/game/types";
import { maskAddress } from "@/lib/game/utils";
import { fetchOwnedCards, mintStarterPack } from "@/lib/stellar/contracts";
import { hasConfiguredContracts } from "@/lib/stellar/config";
import { cn } from "@/lib/utils";

export function InventoryPanel({ compact = false }: { compact?: boolean }) {
  const wallet = useWallet();
  const [cards, setCards] = useState<InventoryCard[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const previewCards = useMemo<InventoryCard[]>(() => {
    return BASE_DECK.slice(0, compact ? 4 : 8).map((card, index) => ({
      ...card,
      tokenId: index + 1,
    }));
  }, [compact]);

  useEffect(() => {
    async function loadInventory() {
      if (!wallet.address || !hasConfiguredContracts()) {
        setCards([]);
        return;
      }

      setIsLoading(true);
      setMessage(null);

      try {
        const owned = await fetchOwnedCards(wallet.address);
        setCards(owned);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load NFT inventory.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadInventory();
  }, [wallet.address]);

  async function handleMint() {
    if (!wallet.address) {
      setMessage("Connect Freighter to mint a starter pack.");
      return;
    }

    if (!hasConfiguredContracts()) {
      setMessage("Set contract IDs in the frontend environment file to enable minting.");
      return;
    }

    setIsMinting(true);
    setMessage(null);

    try {
      await mintStarterPack(wallet.address, difficulty);
      const refreshed = await fetchOwnedCards(wallet.address);
      setCards(refreshed);
      setMessage(`Starter pack minted for ${maskAddress(wallet.address)}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Mint failed.");
    } finally {
      setIsMinting(false);
    }
  }

  const displayCards = cards.length > 0 ? cards : previewCards;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-cyan-100/90">
            <Sparkles className="h-3.5 w-3.5" />
            NFT inventory
          </p>
          <h2 className="text-2xl font-semibold text-white">Collect your cosmic card set</h2>
          <p className="mt-2 text-sm text-slate-300">
            Mint a starter pack on Soroban, then use the same cosmic card identities in your game sessions.
          </p>
        </div>
        <span className="hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 sm:inline-flex">
          {wallet.address ? maskAddress(wallet.address) : "Demo preview"}
        </span>
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
              {option === "easy" ? "Starter 4x4" : "Starter 6x6"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => void handleMint()}
          disabled={isMinting}
          className="inline-flex items-center gap-2 rounded-full bg-cosmic-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cosmic-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isMinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
          {isMinting ? "Minting..." : "Mint starter pack"}
        </button>
      </div>

      {message ? (
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
          {message}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading inventory from Soroban...
        </div>
      ) : (
        <div className={cn("grid gap-3", compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4") }>
          {displayCards.map((card) => (
            <div
              key={`${card.tokenId}-${card.pairId}`}
              className="rounded-3xl border border-white/10 bg-cosmic-900/70 p-4 transition hover:-translate-y-1 hover:border-cyan-300/30"
            >
              <div className={cn("mb-4 flex h-20 items-center justify-center rounded-2xl bg-gradient-to-br text-4xl text-white", card.accent)}>
                {card.glyph}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">{card.name}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{card.constellation}</p>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="rounded-full border border-white/10 px-2 py-1">#{card.tokenId}</span>
                  <span className="inline-flex items-center gap-1 text-cyan-200">
                    <Stars className="h-3.5 w-3.5" />
                    {card.rarity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
