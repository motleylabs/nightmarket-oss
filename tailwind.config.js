const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './styles/**/*.css',
    './src/pages/**/*.tsx',
    './src/layouts/**/*.tsx',
    './src/components/**/*.tsx',
  ],
  safelist: [
    {
      pattern: /grid-cols-(1|2|3|4|6|8)/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'],
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter ', ...defaultTheme.fontFamily.sans],
        mono: ['Space_Mono', ...defaultTheme.fontFamily.mono],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      borderRadius: {
        md: '0.25rem',
      },
      colors: {
        themeprimary: {
          600: '#7C1E05',
          700: '#DA6C1D',
          800: '#EC9D08',
          900: '#F85C04',
        },
        themetext: {
          500: '#4F4F4F',
          600: '#828282',
          700: '#A8A8A8',
          800: '#BDBDBD',
          900: '#FFFFFF',
        },
        themebg: {
          600: '#262626',
          700: '#17161C',
          800: '#0B0A0E',
          900: '#000000',
        },
        orange: {
          200: '#2C2119',
          500: '#DA6C1D',
          600: '#E15A0A',
        },
        gray: {
          25: '#FEFEFE',
          50: '#F4F4F4',
          100: '#E0E0E0',
          200: '#C6C6C6',
          300: '#A8A8A8',
          400: '#8D8D8D',
          500: '#707070',
          600: '#525252',
          700: '#383838',
          800: '#262626',
          900: '#191919',
        },
      },
      keyframes: {
        draw: {
          '0%': { border: '2px solid transparent' },
          '25%': { borderTop: '2px solid' },
          '50%': { borderRight: '2px solid' },
          '75%': { borderBottom: '2px solid' },
          '100%': {
            borderColor: '0s ease-out 0.5',
            border: 'width 0.25s ease-out 0.5s, height 0.25s ease-out 0.75s',
          },
        },
      },
      animation: {
        'draw-border': 'draw .5s',
      },
    },
  },
  plugins: [require('tailwind-scrollbar')],
};
