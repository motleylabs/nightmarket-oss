const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

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
      fontSize: {
        sm: ['0.75rem', '1rem'],
        // base: '1rem',
      },
      fontFamily: {
        serif: ['Brice', ...defaultTheme.fontFamily.serif],
        sans: ['Hauora', 'Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Space_Mono', ...defaultTheme.fontFamily.mono],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      borderRadius: {
        md: '0.25rem',
      },
      colors: {
        primary: {
          500: '#2C2119',
          600: '#7C1E05',
          650: '#C6580A',
          700: '#DA6C1D',
          850: '#E15A0A',
          800: '#EC9D08',
          900: '#F85C04',
        },
        gray: {
          25: '#FEFEFE',
          50: '#F2F2F2', // Part of new theme
          100: '#E0E0E0',
          200: '#C6C6C6',
          250: '#BDBDBD', // Part of new theme
          300: '#A8A8A8', // Part of new theme
          350: '#8B8B8E', // Part of new theme
          400: '#8D8D8D',
          450: '#828282', // Part of new theme
          500: '#707070',
          600: '#525252',
          700: '#383838',
          725: '#2B2A30', // Part of new theme
          750: '#262626', // Part of new theme
          800: '#17161C', // Part of new theme
          900: '#191919',
          // 950: '#0B0A0E', // Part of new theme
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
  plugins: [
    require('tailwind-scrollbar'),
    require('@tailwindcss/line-clamp'),
    plugin(function ({ addUtilities }) {
      addUtilities({
        /* Hide scrollbar for Chrome, Safari and Opera */
        '.no-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
        /* Hide scrollbar for IE, Edge and Firefox */
        '.no-scrollbar': {
          '-ms-overflow-style': 'none' /* IE and Edge */,
          'scrollbar-width': 'none' /* Firefox */,
        },
      });
    }),
  ],
};
