/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    minWidth: {
      '1/2': '50%',
    },
    extend: {
      colors: {
        'light-blue': colors.sky,
        cyan: colors.cyan,
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}