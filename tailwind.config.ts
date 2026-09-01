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
          primary: "#1D9E75",
          "primary-dark": "#178761",
          "primary-light": "#E6F4EF",
          accent: "#D85A30",
          "accent-dark": "#B54A27",
          "accent-light": "#FCE9E3",
        },
      },
    },
  },
  plugins: [],
};
export default config;
