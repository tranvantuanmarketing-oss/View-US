import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: "#f8fafc",
          surface: "#ffffff",
          card: "#ffffff",
          cardHover: "#f1f5f9",
          border: "#bfdbfe",
          borderLight: "#e2e8f0",
          borderDark: "#3b82f6",
          text: "#0f172a",
          textSecondary: "#334155",
          muted: "#64748b",
          dim: "#94a3b8",
          accent: "#2563eb",
          accentHover: "#1d4ed8",
          accentLight: "#eff6ff",
          brandPink: "#b02a87",
          brandPinkBg: "#fdf2f8",
          brandPinkBorder: "#fbcfe8",
          primary: "#2563eb",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
export default config;
