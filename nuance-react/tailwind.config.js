/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0c0b0a',
          2: '#151310',
          3: '#1d1a16',
        },
        ivory: {
          DEFAULT: '#f4efe6',
          dim: '#d9d0c1',
        },
        sand: {
          DEFAULT: '#b9ab93',
          dim: '#8a7d69',
        },
        brass: {
          DEFAULT: '#a9895a',
          lt: '#c9ab78',
          dim: '#6e5a3c',
        },
        line: {
          DEFAULT: 'rgba(244,239,230,0.14)',
          brass: 'rgba(169,137,90,0.45)',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Times New Roman', 'serif'],
        sans: ['Archivo', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
