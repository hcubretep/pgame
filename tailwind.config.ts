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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'xp-float': {
          '0%':   { transform: 'translateY(0)',    opacity: '1' },
          '70%':  { transform: 'translateY(-32px)', opacity: '1' },
          '100%': { transform: 'translateY(-48px)', opacity: '0' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'xp-float': 'xp-float 2.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
export default config;
