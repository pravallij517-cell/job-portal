/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        soft: '0 8px 24px rgba(69, 48, 32, 0.10)',
        gold: '0 8px 24px rgba(178, 138, 69, 0.18)',
      },
      colors: {
        brand: {
          50: '#f5f0e8',
          100: '#e9ddcc',
          200: '#d8c5aa',
          300: '#c3a77e',
          400: '#aa8754',
          500: '#916d3f',
          600: '#79552f',
          700: '#604126',
          800: '#49301f',
          900: '#362219',
          950: '#24150f',
        },
        gold: {
          50: '#fbf6e9',
          100: '#f3e5b8',
          200: '#e8cf89',
          300: '#d9b963',
          400: '#c8a24e',
          500: '#b28a45',
          600: '#967033',
          700: '#765522',
          800: '#5b411c',
          900: '#423016',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Segoe UI', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
