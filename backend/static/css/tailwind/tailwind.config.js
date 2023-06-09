/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");
const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
  content: [
    "../../../../frontend/*.{html,js}",
    "../../../../backend/*.{html,js}",
    "../../../../frontend/**/*.{html,js}",
    "../../../../backend/**/*.{html,js}",
    "../../../../frontend/**/**/*.{html,js}",
    "../../../../backend/**/**/*.{html,js}",
    "../../../../frontend/**/**/**/*.{html,js}",
    "../../../../backend/**/**/**/*.{html,js}",
    "../../../../frontend/**/**/**/**/*.{html,js}",
    "../../../../backend/**/**/**/**/*.{html,js}",
    "../../../../frontend/**/**/**/**/**/*.{html,js}",
    "../../../../backend/**/**/**/**/**/*.{html,js}",
    "../../../../backend/templates/_base.html",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        'display': ['Quicksand', ...defaultTheme.fontFamily.sans],
        'roboto': ['Roboto', 'sans-serif'],
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
        black: colors.black,
        white: colors.white,
        gray: colors.gray,
        yellow: colors.yellow,
        slate: colors.slate,
        red: colors.red,
        indigo: colors.indigo,
        blue: colors.blue,
        brandgreen: {
          50: "#f7faf6",
          100: "#ecf3ea",
          200: "#cde5cc",
          300: "#aed7ae",
          400: "#6fc980",
          500: "#548a6a",
          600: "#4c7e5e",
          700: "#406a4c",
          800: "#32533a",
          900: "#264429",
        },
        'google-blue': '#4285f4',
        'button-active-blue': '#1669F2',
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
