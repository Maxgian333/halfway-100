/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0E0F0C',
        inkRaised: '#16170F',
        gold: '#C9A227',
        goldBright: '#E3C462',
        forest: '#1F3D2B',
        parchment: '#E8E2D0',
        muted: '#9A9482',
        ember: '#7A2E2E',
        emberBright: '#B5462E',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.25em',
      },
    },
  },
  plugins: [],
};
