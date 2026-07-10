import { CardTemplate, Difficulty } from "@/lib/game/types";

export const GRID_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 4,
  medium: 6,
};

export const PAIRS_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 8,
  medium: 18,
};

export const BASE_DECK: CardTemplate[] = [
  { pairId: 0, name: "Nova Spark", glyph: "✦", accent: "from-fuchsia-500 to-violet-500", rarity: "core", constellation: "Orion" },
  { pairId: 1, name: "Orbital Bloom", glyph: "🪐", accent: "from-sky-500 to-cyan-400", rarity: "core", constellation: "Lyra" },
  { pairId: 2, name: "Comet Trail", glyph: "☄", accent: "from-amber-400 to-orange-500", rarity: "core", constellation: "Draco" },
  { pairId: 3, name: "Moon Echo", glyph: "☾", accent: "from-slate-300 to-indigo-400", rarity: "core", constellation: "Hydra" },
  { pairId: 4, name: "Photon Pulse", glyph: "✺", accent: "from-emerald-400 to-teal-500", rarity: "core", constellation: "Ursa" },
  { pairId: 5, name: "Rocket Relay", glyph: "🜂", accent: "from-rose-500 to-red-500", rarity: "core", constellation: "Vela" },
  { pairId: 6, name: "Stellar Token", glyph: "⬢", accent: "from-yellow-400 to-lime-400", rarity: "core", constellation: "Centa" },
  { pairId: 7, name: "Soroban Rune", glyph: "⌘", accent: "from-violet-400 to-purple-600", rarity: "core", constellation: "Pavo" },
  { pairId: 8, name: "Nebula Bloom", glyph: "✹", accent: "from-pink-400 to-rose-500", rarity: "rare", constellation: "Cygnus" },
  { pairId: 9, name: "Aurora Arc", glyph: "⚡", accent: "from-cyan-400 to-blue-500", rarity: "rare", constellation: "Aquila" },
  { pairId: 10, name: "Gravity Well", glyph: "◉", accent: "from-indigo-400 to-violet-700", rarity: "rare", constellation: "Perseus" },
  { pairId: 11, name: "Quasar Crest", glyph: "✶", accent: "from-orange-400 to-pink-500", rarity: "rare", constellation: "Taurus" },
  { pairId: 12, name: "Solar Halo", glyph: "☼", accent: "from-yellow-300 to-orange-400", rarity: "rare", constellation: "Aries" },
  { pairId: 13, name: "Meteor Ring", glyph: "⟡", accent: "from-lime-300 to-emerald-500", rarity: "rare", constellation: "Carina" },
  { pairId: 14, name: "Astro Lattice", glyph: "⌬", accent: "from-fuchsia-400 to-pink-600", rarity: "rare", constellation: "Volans" },
  { pairId: 15, name: "Zenith Pulse", glyph: "✷", accent: "from-purple-500 to-indigo-500", rarity: "rare", constellation: "Lupus" },
  { pairId: 16, name: "Orbit Key", glyph: "☍", accent: "from-sky-400 to-indigo-500", rarity: "rare", constellation: "Lepus" },
  { pairId: 17, name: "Celestial Prism", glyph: "❖", accent: "from-amber-300 to-fuchsia-500", rarity: "rare", constellation: "Columba" },
];

export const DAILY_TARGETS: Record<Difficulty, number> = {
  easy: 1200,
  medium: 2600,
};
