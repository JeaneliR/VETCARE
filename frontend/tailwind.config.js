/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effcfa",
          100: "#c9f7ef",
          200: "#94eedf",
          300: "#5bdcc9",
          400: "#2cc1ae",
          500: "#14a394",
          600: "#0d8377",
          700: "#0f6a61",
          800: "#11544e",
          900: "#114440",
          950: "#062623",
        },
        ocean: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
      },
    },
  },
  plugins: [],
};
