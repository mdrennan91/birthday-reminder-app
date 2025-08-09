/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/globals.css"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",       
    },
    extend: {
      colors: {
        lavender: "#e5e1ee",
        mint: "#dffdff",
        teal: "#90bede",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"]
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // for animate-in, slide-in-from-left, fade-in, etc.
  ],
};
