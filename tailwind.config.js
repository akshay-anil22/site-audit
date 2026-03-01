/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <-- This prevents the dark background clash
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Figma uses Inter
      }
    },
  },
  plugins: [],
}