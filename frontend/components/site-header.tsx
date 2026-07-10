"use client";

import Link from "next/link";
import { Rocket, Sparkles } from "lucide-react";

import { WalletButton } from "@/components/wallet-button";
import { useWallet } from "@/components/providers/wallet-provider";

const navItems = [
  { href: "/", label: "Play" },
  { href: "/inventory", label: "Inventory" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/how-to-play", label: "How to play" },
];

export function SiteHeader() {
  const wallet = useWallet();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-cosmic-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-cosmic-500 to-fuchsia-500 shadow-glow">
              <Rocket className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/80">Stellar • Soroban</p>
              <p className="text-xl font-semibold">Stellar Flip</p>
            </div>
          </Link>
          <WalletButton className="md:hidden" />
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-transparent px-3 py-2 transition hover:border-white/10 hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
          <WalletButton className="hidden md:inline-flex" />
        </nav>
      </div>
      {wallet.error ? (
        <div className="mx-auto max-w-7xl px-4 pb-3 text-sm text-rose-300 md:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" />
            {wallet.error}
          </span>
        </div>
      ) : null}
    </header>
  );
}
