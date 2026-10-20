/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        craft: {
          50: '#fdf8f6',
          100: '#f7ece8',
          200: '#edd5cf',
          300: '#dfb5ab',
          400: '#cf8e81',
          500: '#be6b5c',
          600: '#b85042', // Terracotta principal da costura
          700: '#9b3f33',
          800: '#80362c',
          900: '#692f28',
          linen: '#faf7f2',
          clay: '#c25e4e',
          sage: '#437a5b',
          ochre: '#c67d26',
        },
      },
    },
  },
  plugins: [],
};
