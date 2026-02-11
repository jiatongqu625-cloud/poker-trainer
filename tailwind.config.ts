import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        base: "#0b0f14",
        panel: "#111827",
        accent: "#10b981",
        ink: "#e5e7eb"
      }
    }
  },
  plugins: []
};

export default config;
