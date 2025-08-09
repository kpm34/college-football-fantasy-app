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
        locker: {
          primary: '#9C0B0B',       // deep red
          primaryDark: '#6E0000',   // darker red
          coral: '#FF6B5E',         // coral accent
          brown: '#6B3F2C',         // warm brown
          taupe: '#B3A6A6',         // soft taupe/grey
          ice: '#DCEFF4',           // light icy blue
          slate: '#3F3F3F',         // dark grey
          slateDark: '#2F2F2F'      // darker grey
        }
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