import { Exo_2, Poppins } from "next/font/google";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        DarkGray: "#1f1f1f",
        orange: "#F88C18",
        LightGray: "#999999",
        limeGreen: "#9FC53A",
        white: "#ffffff",
        black: "#000000",
        cGray: "#999",
        lightOrange: "#FEF2E4",
        darkGreen: "#1F2A00",
        mediumGray: "#DADADA",
        DarkerGreen: "#1A685B",
        darkBlue: "#2563EB",
        lightBlueBg: "#1FB6ED",
        offWhite: "#F6F6F6",
        gold: {
          100: "#fef9e7",
          300: "#f7dc6f",
          400: "#f1c40f",
          500: "#d4ac0d",
          600: "#b7950b",
          700: "#9a7d0a",
          800: "#7d6608",
        },
      },
      fontFamily: {
        poppins: ["var(--font-poppins)"],
        exo2: ["var(--font-exo2)"],
      },
      boxShadow: {
        articleCard: " 0px 5.112px 15.336px 0px rgba(0, 0, 0, 0.06)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-in-out",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
