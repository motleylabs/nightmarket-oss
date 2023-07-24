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
        bronze: {
          500: '#84665D20',
          600: '#84665D',
        },
        silver: {
          500: '#98989820',
          600: '#989898',
        },
        gold: {
          500: '#FFC600',
          600: '#F3C31A',
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
          450: '#4C4C4C',
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
        ticket: {
          '0%': {
            backgroundImage: "url('/images/animated/ticket/1.svg')",
          },
          '18%': {
            backgroundImage: "url('/images/animated/ticket/2.svg')",
          },
          '36%': {
            backgroundImage: "url('/images/animated/ticket/3.svg')",
          },
          '54%': {
            backgroundImage: "url('/images/animated/ticket/4.svg')",
          },
          '72%': {
            backgroundImage: "url('/images/animated/ticket/5.svg')",
          },
          '90%': {
            backgroundImage: "url('/images/animated/ticket/6.svg')",
          },
          '100%': {
            backgroundImage: "url('/images/animated/ticket/7.svg')",
          },
        },
        'ticket-reverse': {
          '0%': {
            backgroundImage: "url('/images/animated/ticket/7.svg')",
          },
          '18%': {
            backgroundImage: "url('/images/animated/ticket/6.svg')",
          },
          '36%': {
            backgroundImage: "url('/images/animated/ticket/5.svg')",
          },
          '54%': {
            backgroundImage: "url('/images/animated/ticket/4.svg')",
          },
          '72%': {
            backgroundImage: "url('/images/animated/ticket/3.svg')",
          },
          '90%': {
            backgroundImage: "url('/images/animated/ticket/2.svg')",
          },
          '100%': {
            backgroundImage: "url('/images/animated/ticket/1.svg')",
          },
        },
        'score-badge-tooltip': {
          '0%': { top: '53px', opacity: '0' },
          '100%': { top: '52px', opacity: '1' },
        },
      },
      animation: {
        refresh: 'refresh 1s ease-in-out',
        ticket: 'ticket .15s linear',
        'ticket-reverse': 'ticket-reverse .15s linear',
        'pulse-it': 'heartbeat 1.5s linear',
        'draw-border': 'draw .5s',
        'draw-border-1s': 'draw-primary 1s',
        'draw-border-3s': 'draw-primary 3s',
        'fade-out': 'fadeOut 3s linear 1500ms',
        'fade-out-black': 'fadeOutBlack 3s linear 1500ms',
        'fade-out-1s': 'fadeOut 1s linear 333ms',
        'fade-out-1.5s-black': 'fadeOutBlack 1.5s linear 0.0001s',
        'score-badge-tooltip': 'score-badge-tooltip 0.4s linear',
      },
      transitionProperty: {
        width: 'width',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
    require('tailwind-clip-path'),
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
