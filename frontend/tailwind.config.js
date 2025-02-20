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
        'fs-xl': 'clamp(1.25rem, 4vw, 5rem)',    // H1 font size, adjusted smaller than before
        'fs-600': 'clamp(1rem, 3vw, 3.5rem)',    // H2 font size, proportional to fs-xl
        'fs-400': 'clamp(0.75rem, 2.5vw, 2rem)',  // Body font size, scaled proportionally
        'fs-300': 'clamp(0.65rem, 2vw, 1.5rem)',  // Paragraph font size, scaled smaller

        // Mobile Font Sizes
        'fs-mobile-heading': 'clamp(0.55rem, 1.5vw + 0.3rem, 2.5rem)', // H1 mobile
        'fs-mobile-subheading': 'clamp(0.55rem, 1.5vw + 0.3rem, 2.5rem)', // Subheading mobile
        'fs-mobile-body': 'clamp(0.35rem, 1.3vw + 0.2rem, 1.00rem)',    // Body mobile, adjusted for smaller scale

        // Medium Font Sizes
        'fs-medium-heading': 'clamp(1rem, 3.5vw, 4.5rem)',   // Medium Heading, relative to fs-xl
        'fs-medium-subheading': 'clamp(0.85rem, 2.5vw, 3.25rem)',  // Medium Subheading, scaled down
        'fs-medium-body': 'clamp(0.75rem, 2vw, 2rem)',      // Medium Body, proportional
      },
    },
  },
  plugins: [],
}
