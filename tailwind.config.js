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
      pattern: /col-span-(1|2|3|4|5|6)/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'],
    },
    {
      pattern: /row-span-(1|2)/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'],
    },
    {
      pattern: /grid-cols-(1|2|3|4|5|6|8)/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'],
    },
    {
      pattern: /gap-(0|1|2|3|4|6|8|10)/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'],
    },
    {
      pattern: /col-span-[0-12]/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'],
    },
  ],
  theme: {
    extend: {
      boxShadow: {
        lside: '-11px 0px 27px -8px #000000',
      },
      gridTemplateColumns: {
        auto: 'repeat(auto-fit, minmax(150px, 1fr))',
        'auto-85': 'repeat(auto-fit, minmax(85px, 1fr))',
      },
      fontSize: {
        xs: ['0.5rem', '0.75rem'],
        sm: ['0.75rem', '1rem'],
      },
      fontFamily: {
        serif: ['var(--font-brice)', ...defaultTheme.fontFamily.serif],
        sans: ['var(--font-hauora)', 'Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Space_Mono', ...defaultTheme.fontFamily.mono],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': `linear-gradient(to right, #F85C04, #7C1E05)`,
        'gradient-hover': `linear-gradient(to right, #F85C04, #EC9D08)`,
        'gradient-secondary': `linear-gradient(to right, #F85C04, #7C1E05)`,
      },
      borderRadius: {
        md: '0.25rem',
      },
      colors: {
        primary: {
          100: '#E15A0A', // 50 in figma
          200: '#C33C00', // 100 in figma
          500: '#ED9E09',
          600: '#7C1E05', // primary gradient finishes here
          700: '#DA6C1D',
          800: '#EC9D08', // secondary gradient finishes here
          900: '#F85C04', // both gradients starts here
        },
        green: {
          100: '#6CE9A6',
          200: '#4AC282',
        },
        red: {
          100: '#F55C47',
          200: '#C83D2A',
        },
        gray: {
          100: '#E0E0E0',
          200: '#BDBDBD',
          300: '#8B8B8E',
          700: '#27262E',
          800: '#17161C',
          900: '#0B0A0E',
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
      transitionProperty: {
        width: 'width',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
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
