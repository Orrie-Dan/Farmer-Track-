import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        earth: {
          50: "#fdf8f0",
          100: "#f5e6d3",
          200: "#e8cba4",
          300: "#d4a574",
          400: "#c08552",
          500: "#a16b3f",
          600: "#8b5a34",
          700: "#6d452a",
          800: "#543420",
          900: "#3d2618",
        },
      },
    },
  },
  plugins: [],
};

export default config;
