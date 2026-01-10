/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F9F8F3',
        emerald: '#064e3b',
        gold: '#C5A059',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
      animation: {
        'slow-zoom': 'slow-zoom 20s ease-out infinite alternate',
        'fade-in-up': 'fade-in-up 1.2s ease-out forwards',
      },
      keyframes: {
        'slow-zoom': {
          from: { transform: 'scale(1)' },
          to: { transform: 'scale(1.1)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

