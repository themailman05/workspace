module.exports = {
  purge: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './containers/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        18: '4.5rem',
        72: '18rem',
        84: '21rem',
        96: '24rem',
        100: '25.5rem',
        104: '27rem',
        112: '30rem',
        128: '40rem',
        129: '52rem',
      },
      lineHeight: {
        button: '32px',
      },
      scale: {
        101: '1.01',
        102: '1.02',
      },
      rotate: {
        '-30': '-30deg',
      },
      colors: {
        primary: '#FDEAA7',
        primaryLight: '#FFF5CF',

        secondary: '#73B7EA',
        secondaryLight: '#DBEAFE',

        ctaYellow: '#F6CB22',
        ctaYellowLight: '#FFD324',
      },
      backgroundImage: (theme) => ({
        'hero-pattern': "url('/images/bgHero.svg')",
        'impact-pattern': "url('/images/bgImpact.svg')",
        'countdown-pattern': "url('/images/bgCountdown.svg')",
        'popcorn1-pattern': "url('/images/bgPopcorn1.svg')",
        'popcorn2-pattern': "url('/images/bgPopcorn2.svg')",
        'popcorn3-pattern': "url('/images/bgPopcorn3.svg')",
      }),
      fontFamily: {
        landing: ['Avenir Next LT Pro', 'sans-serif'],
      },
    },
  },
  variants: {
    extend: { opacity: ['disabled'] },
  },
  plugins: [],
};
