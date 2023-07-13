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
          600: '#4C4C4C',
          700: '#27262E',
          750: '#282828',
          800: '#17161C',
          850: '#0A0A0A',
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
        refresh: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        heartbeat: {
          '0%': { transform: 'scale(0.9)' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(0.9)' },
        },
        fadeOut: {
          '0%': { opacity: '100%' },
          '25%': { opacity: '75%' },
          '50%': { opacity: '50%' },
          '75%': { opacity: '25%' },
          '90%': {
            display: 'hidden',
            opacity: '0%',
          },
        },
        fadeOutBlack: {
          '0%': { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
          '25%': { backgroundColor: 'rgba(0, 0, 0, 0.25)' },
          '50%': { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
          '75%': { backgroundColor: 'rgba(0, 0, 0, 0.75)' },
          '100%': { backgroundColor: 'rgba(0, 0, 0, 1)' },
        },
        'draw-primary': {
          '0%': { border: '2px solid #F85C04' },
          '25%': { borderTop: '2px solid #F85C04' },
          '50%': { borderRight: '2px solid #F85C04' },
          '75%': { borderBottom: '2px solid #F85C04' },
          '100%': {
            borderColor: '0s ease-out 0.5',
            border: 'width 0.25s ease-out 0.5s, height 0.25s ease-out 0.75s',
          },
        },
        bulb: {
          '0%': {
            backgroundImage: "url('/images/animated/bulb/1.svg')",
          },
          '20%': {
            backgroundImage: "url('/images/animated/bulb/2.svg')",
          },
          '40%': {
            backgroundImage: "url('/images/animated/bulb/3.svg')",
          },
          '60%': {
            backgroundImage: "url('/images/animated/bulb/4.svg')",
          },
          '80%': {
            backgroundImage: "url('/images/animated/bulb/5.svg')",
          },
          '100%': {
            backgroundImage: "url('/images/animated/bulb/6.svg')",
          },
        },
        bulbAfter: {
          '0%': {
            backgroundImage: "url('/images/animated/bulb/7.svg')",
          },
          '7%': {
            backgroundImage: "url('/images/animated/bulb/8.svg')",
          },
          '14%': {
            backgroundImage: "url('/images/animated/bulb/9.svg')",
          },
          '21%': {
            backgroundImage: "url('/images/animated/bulb/10.svg')",
          },
          '28%': {
            backgroundImage: "url('/images/animated/bulb/11.svg')",
          },
          '35%': {
            backgroundImage: "url('/images/animated/bulb/12.svg')",
          },
          '42%': {
            backgroundImage: "url('/images/animated/bulb/13.svg')",
          },
          '49%': {
            backgroundImage: "url('/images/animated/bulb/14.svg')",
          },
          '56%': {
            backgroundImage: "url('/images/animated/bulb/15.svg')",
          },
          '63%': {
            backgroundImage: "url('/images/animated/bulb/16.svg')",
          },
          '70%': {
            backgroundImage: "url('/images/animated/bulb/17.svg')",
          },
          '77%': {
            backgroundImage: "url('/images/animated/bulb/18.svg')",
          },
          '84%': {
            backgroundImage: "url('/images/animated/bulb/19.svg')",
          },
          '91%': {
            backgroundImage: "url('/images/animated/bulb/20.svg')",
          },
          '100%': {
            backgroundImage: "url('/images/animated/bulb/21.svg')",
          },
        },
        'score-badge-tooltip': {
          '0%': { top: '52px', opacity: '0' },
          '100%': { top: '52px', opacity: '1' },
        },
      },
      animation: {
        refresh: 'refresh 1s ease-in-out',
        'pulse-it': 'heartbeat 1.5s linear',
        'draw-border': 'draw .5s',
        'draw-border-1s': 'draw-primary 1s',
        'draw-border-3s': 'draw-primary 3s',
        'fade-out': 'fadeOut 3s linear 1500ms',
        'fade-out-black': 'fadeOutBlack 3s linear 1500ms',
        'fade-out-1s': 'fadeOut 1s linear 333ms',
        'fade-out-1.5s-black': 'fadeOutBlack 1.5s linear 500ms',
        'score-badge-tooltip': 'score-badge-tooltip 0.6s linear ',
        bulb: 'bulb .2s ease-in',
        'bulb-after': 'bulbAfter 1s ease-in',
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
