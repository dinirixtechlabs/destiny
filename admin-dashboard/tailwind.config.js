/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#38a9f8',
          500: '#0096f0', // Dominant logo blue
          600: '#0078d4',
          700: '#005fa8',
          800: '#054378',
          900: '#072a52',
          950: '#071439', // Logo midnight navy
        },
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#38a9f8',
          500: '#0096f0',
          600: '#0078d4',
          700: '#005fa8',
          800: '#054378',
          900: '#072a52',
          950: '#071439',
        }
      }
    },
  },
  plugins: [],
}
