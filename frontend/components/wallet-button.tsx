"use client";

import { Loader2, LogOut, Wallet } from "lucide-react";

import { useWallet } from "@/components/providers/wallet-provider";
import { maskAddress } from "@/lib/game/utils";
import { cn } from "@/lib/utils";

export function WalletButton({ className }: { className?: string }) {
  const wallet = useWallet();

  return wallet.isConnected ? (
    <button
      type="button"
      onClick={wallet.clear}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15",
        className,
      )}
    >
      <LogOut className="h-4 w-4" />
      {maskAddress(wallet.address ?? "Connected")}
    </button>
  ) : (
    <button
      type="button"
      onClick={() => void wallet.connect()}
      disabled={wallet.isConnecting}
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-cosmic-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-cosmic-400 disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
    >
      {wallet.isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
      {wallet.isConnecting ? "Connecting..." : "Connect Freighter"}
    </button>
  );
}
