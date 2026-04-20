/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#131313',
        'surface-low': '#1c1b1b',
        'surface-container': '#201f1f',
        'surface-high': '#2a2a2a',
        'surface-highest': '#353534',
        'surface-lowest': '#0e0e0e',
        primary: '#f6adff',
        'primary-container': '#e04cff',
        secondary: '#c7bfff',
        'secondary-container': '#4635a7',
        tertiary: '#f5be50',
        outline: '#a08a9f',
        'outline-variant': '#534153',
        'on-surface': '#e5e2e1',
        'on-primary': '#560068',
        error: '#ffb4ab',
      },
      fontFamily: {
        serif: ['"Noto Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(224, 76, 255, 0.35)',
        'glow-sm': '0 0 10px rgba(224, 76, 255, 0.25)',
        'glow-gold': '0 0 30px rgba(245, 190, 80, 0.5)',
        'glow-red': '0 0 15px rgba(255, 180, 171, 0.4)',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pulse_glow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(224,76,255,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(224,76,255,0.7)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
        floatIn: 'floatIn 0.4s ease-out forwards',
        pulse_glow: 'pulse_glow 2s ease-in-out infinite',
        slideDown: 'slideDown 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
