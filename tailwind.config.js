const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./styles/**/*.css",
    "./src/pages/**/*.tsx",
    "./src/layouts/**/*.tsx",
    "./src/components/**/*.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter ', ...defaultTheme.fontFamily.sans],
        mono: ['Space_Mono', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        gray: {
          25: '#FEFEFE',
          50: '#F4F4F4',
          100: '#E0E0E0',
          200: '#C6C6C6',
          300: '#A8A8A8',
          400: '#8D8D8D',
          500: '#6F6F6F',
          600: '#525252',
          700: '#393939',
          800: '#262626',
          900: '#171717',
        },
      }
    },
  },
  plugins: [],
}
