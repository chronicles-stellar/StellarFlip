import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          950: "#050816",
          900: "#0b1026",
          800: "#121936",
          700: "#18214a",
          500: "#6d7cff",
          400: "#8d9bff",
          300: "#aeb7ff",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(145, 155, 255, 0.2), 0 12px 50px rgba(78, 92, 255, 0.25)",
      },
      backgroundImage: {
        stars: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18) 0 1px, transparent 1px), radial-gradient(circle at 80% 0%, rgba(140,160,255,0.18) 0 1px, transparent 1px), linear-gradient(180deg, rgba(11,16,38,0.95), rgba(5,8,22,1))",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
