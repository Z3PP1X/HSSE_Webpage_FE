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
        'customAlarmplanGray': '#2E2F2F',
        'customAlarmplanGreen': '#23A98D',
        'customAlarmplanRed': '#E93837',
        'customAlarmplanBlack': '#2E2F2F',
        'customAlarmplanSubheadline': '#85878B',
      },
      fontSize: {
        'fs-heading': 'clamp(28px, 2.5vw, 34px)',
        'fs-category-heading': 'clamp(20px, 1.8vw, 24px)',
        'fs-subheading': 'clamp(11px, 1.2vw, 13.5px)',
        'fs-text': 'clamp(9px, 1vw, 11px)',
      },
    },
  },
  plugins: [],
}
