/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: "#1B51EC",
        "primary-blue": "#1B59EC",
        "primary-dark": "#0F172A",
        "primary-light": "#F8FAFC",
        "primary-gray": "#64748B",
        "primary-border": "#E2E8F0",
        "primary-background": "#F8FAFC",
        "primary-text": "#0F172A",
        "primary-text-light": "#64748B",
        "primary-text-dark": "#0F172A",
        "primary-text-gray": "#64748B",
        "primary-text-border": "#E2E8F0",
        "primary-text-background": "#F8FAFC",
        "primary-text-light": "#64748B",
        "primary-text-dark": "#0F172A",
        "primary-text-gray": "#64748B",
      },
    },
  },
  plugins: [],
};
