import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0D1117",
        grid: "#1C2333",
        primary: "#00F5FF",
        secondary: "#FFB800"
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Menlo", "monospace"],
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
