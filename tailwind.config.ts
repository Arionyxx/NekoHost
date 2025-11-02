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
        // Catppuccin Macchiato palette
        ctp: {
          rosewater: "#f4dbd6",
          flamingo: "#f0c6c6",
          pink: "#f5bde6",
          mauve: "#c6a0f6",
          red: "#ed8796",
          maroon: "#ee99a0",
          peach: "#f5a97f",
          yellow: "#eed49f",
          green: "#a6da95",
          teal: "#8bd5ca",
          sky: "#91d7e3",
          sapphire: "#7dc4e4",
          blue: "#8aadf4",
          lavender: "#b7bdf8",
          text: "#cad3f5",
          subtext1: "#b8c0e0",
          subtext0: "#a5adcb",
          overlay2: "#939ab7",
          overlay1: "#8087a2",
          overlay0: "#6e738d",
          surface2: "#5b6078",
          surface1: "#494d64",
          surface0: "#363a4f",
          base: "#24273a",
          mantle: "#1e2030",
          crust: "#181926",
        },
        // Semantic aliases
        background: "#24273a",
        "background-mantle": "#1e2030",
        "background-crust": "#181926",
        foreground: "#cad3f5",
        "foreground-muted": "#b8c0e0",
        border: "#5b6078",
        accent: "#c6a0f6",
        "accent-hover": "#b7bdf8",
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(24, 25, 38, 0.4)",
        "soft-lg": "0 4px 16px rgba(24, 25, 38, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
