const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

const screens = { ...defaultTheme.screens };
delete screens["xl"];
delete screens["2xl"];

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      center: true,
      screens,
    },
    extend: {
      colors: {
        "blue-gray": colors.blueGray,
        sky: colors.sky,
      },
      maxHeight: {
        "70-screen": "70vh",
      },
    },
  },
  variants: {
    extend: {
      borderStyle: ["hover", "focus"],
    },
  },
  plugins: [],
};
