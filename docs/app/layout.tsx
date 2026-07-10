import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stellar Flip Docs",
  description: "Documentation site for the Stellar Flip monorepo.",
};

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/architecture", label: "Architecture" },
  { href: "/deployment", label: "Deployment" },
  { href: "/contributing", label: "Contributing" },
];

export default function DocsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-cosmic-950 text-white">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(109,124,255,0.18),transparent_28%),linear-gradient(180deg,#0b1026_0%,#050816_100%)]">
          <header className="border-b border-white/10 bg-cosmic-950/75 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Stellar Flip</p>
                <h1 className="text-2xl font-semibold">Documentation</h1>
              </div>
              <nav className="flex flex-wrap gap-2 text-sm text-slate-200">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
