/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#000000',
          sidebar: '#0a0a0a',
          border: '#1a1a1a',
          text: '#d1d1d1',
          muted: '#666666',
          accent: '#ff9900', // Bloomberg-style orange
          up: '#00ff00',
          down: '#ff0000',
          row: '#050505',
          hover: '#121212'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
