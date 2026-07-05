import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#121417",
        paper: "#f7f5f0",
        fog: "#ece8df",
        line: "#ddd7ca",
        moss: "#516354",
        coral: "#d96c4a",
        gold: "#dca63a",
        tide: "#217c8f",
        night: "#0d0f12"
      },
      boxShadow: {
        panel: "0 16px 45px rgba(17, 21, 24, 0.09)",
        lift: "0 22px 70px rgba(17, 21, 24, 0.14)"
      },
      animation: {
        "fade-up": "fadeUp .5s ease both",
        "soft-pulse": "softPulse 1.8s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        softPulse: {
          "0%, 100%": { opacity: ".58" },
          "50%": { opacity: "1" }
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-serif", "Georgia"]
      }
    }
  },
  plugins: []
};

export default config;
