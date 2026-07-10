import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cosmic: {
          950: "#050816",
          900: "#0b1026",
          800: "#121936",
          500: "#6d7cff",
          400: "#8d9bff",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(145, 155, 255, 0.18), 0 12px 50px rgba(78, 92, 255, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
