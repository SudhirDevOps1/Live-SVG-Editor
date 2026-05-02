/**
 * Tailwind CSS configuration (compatibility layer for Tailwind v4)
 * Primary configuration is in src/index.css via @theme directive
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
