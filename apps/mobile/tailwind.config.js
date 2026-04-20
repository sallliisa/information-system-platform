/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{tsx,ts}', './src/**/*.{tsx,ts}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        surface: '#f8fafc',
        primary: '#0f766e',
        border: '#cbd5e1',
        text: '#0f172a',
      },
    },
  },
}
