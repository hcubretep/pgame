import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Bloom Now CI: ruhige, warme Farben
        bloom: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#ebe1d4',
          300: '#dccbb3',
          400: '#c9ae8e',
          500: '#b89470',
          600: '#a67d5b',
          700: '#8a654c',
          800: '#715343',
          900: '#5d453a',
          950: '#31231d',
        },
        sage: {
          50: '#f6f7f6',
          100: '#e3e7e3',
          200: '#c6cfc6',
          300: '#a1afa1',
          400: '#7b8d7b',
          500: '#607260',
          600: '#4c5a4c',
          700: '#3f4a3f',
          800: '#353d35',
          900: '#2e342e',
          950: '#171b17',
        },
        // Ampel-Farben (ruhig, nicht alarmistisch)
        signal: {
          green: '#6b9080',
          yellow: '#d4a574',
          red: '#c17767',
          neutral: '#9ca3af',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
    },
  },
  plugins: [],
}

export default config
