/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  safelist: [
    'navbar-icon',
    'navbar-tooltip',
  ],
  theme: {
    extend: {
      colors: {
        'sixt-orange': '#fc5000',
        'sixt-black': '#18181a',
      },
    },
  },
  plugins: [],
}
