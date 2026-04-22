/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: "#e63946",
        charcoal: "#0f0f0f",
      }
    },
  },
  plugins: [],
}