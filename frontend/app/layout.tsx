import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

import { WalletProvider } from "@/components/providers/wallet-provider";
import { SiteHeader } from "@/components/site-header";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "Stellar Flip",
  description: "A polished Web3 memory match game built with Next.js, Soroban, and Stellar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} bg-cosmic-950 text-white`}>
        <WalletProvider>
          <div className="min-h-screen bg-stars bg-[length:160px_160px,220px_220px,auto]">
            <SiteHeader />
            <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:py-10">{children}</main>
            <footer className="border-t border-white/10 bg-cosmic-950/70">
              <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between md:px-6">
                <p>Open-source under MIT. Built for Stellar builders and GrantFox bounties.</p>
                <p>Next.js · Soroban · Freighter · Stellar SDK</p>
              </div>
            </footer>
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
