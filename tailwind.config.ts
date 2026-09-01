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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          primary: "#4FA9D1",
          "primary-dark": "#2E7FA3",
          "primary-light": "#EAF6FB",
          accent: "#E8779E",
          "accent-dark": "#C85E7F",
          "accent-light": "#FCE8EE",
        },
      },
    },
  },
  plugins: [],
};
export default config;
