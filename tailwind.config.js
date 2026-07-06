/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Night Ledger design tokens
        bg: {
          DEFAULT: '#14151F',
          light: '#F7F6F2',
        },
        surface: {
          DEFAULT: '#1C1E2C',
          light: '#FFFFFF',
          border: '#2A2D3E',
        },
        text: {
          primary: '#EDEDF2',
          muted: '#9598AC',
          light: '#1C1E2C',
          'light-muted': '#6B6E82',
        },
        accent: {
          DEFAULT: '#E8A33D',
          hover: '#F0B558',
          muted: '#E8A33D26',
        },
        positive: {
          DEFAULT: '#3DDC97',
          muted: '#3DDC9726',
        },
        negative: {
          DEFAULT: '#FF6B6B',
          muted: '#FF6B6B26',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        'stamp': '50%',
      },
      animation: {
        'stamp-press': 'stampPress 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        stampPress: {
          '0%': { transform: 'rotate(-12deg) scale(1)' },
          '30%': { transform: 'rotate(-8deg) scale(1.15)' },
          '60%': { transform: 'rotate(-14deg) scale(0.9)' },
          '80%': { transform: 'rotate(-12deg) scale(1.05)' },
          '100%': { transform: 'rotate(-12deg) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
