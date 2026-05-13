import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FAF7F2",
          50: "#FDFCFA",
          200: "#F2EBE0",
        },
        espresso: {
          DEFAULT: "#1C1410",
          light: "#2A1F18",
          card: "#241A13",
        },
        champagne: {
          DEFAULT: "#C9A96E",
          light: "#D9BF8E",
          dark: "#A8884E",
        },
        muted: "#8A7968",
        warm: {
          DEFAULT: "#8B4513",
          light: "#A0522D",
          muted: "#CD853F",
          bg: "#FDF6EE",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
