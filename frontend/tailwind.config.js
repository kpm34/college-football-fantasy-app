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
        chrome: '#FFD700',
        'chrome-dark': '#FFA500',
      },
      fontFamily: {
        'bebas': ['var(--font-bebas)', 'sans-serif'],
        'montserrat': ['var(--font-montserrat)', 'sans-serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        'mono': ['var(--font-roboto-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
} 