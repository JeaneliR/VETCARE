/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7f4",
          100: "#d5ece3",
          200: "#aed9c9",
          300: "#7cc0aa",
          400: "#4fa287",
          500: "#33866d",
          600: "#256b58",
          700: "#1f5647",
          800: "#1c453a",
          900: "#193a31",
        },
      },
    },
  },
  plugins: [],
};
