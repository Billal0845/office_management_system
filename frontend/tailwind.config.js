/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // This is crucial for the dark mode toggle
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "Hind Siliguri", "sans-serif"],
      },
    },
  },
  plugins: [],
};
