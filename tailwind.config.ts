import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface)",
        surfaceAlt: "var(--surface-alt)",
        border: "var(--border)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        brand: "var(--brand)",
        brandDeep: "var(--brand-deep)"
      },
      boxShadow: {
        soft: "0 20px 80px rgba(15, 23, 42, 0.15)"
      }
    }
  },
  plugins: []
};

export default config;
