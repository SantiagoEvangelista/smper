/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A1A1A',
          light: '#333333',
          dark: '#000000',
        },
        beige: {
          DEFAULT: '#EDE5D9',
          light: '#F5F0E6',
          dark: '#D9CBB9',
        },
        background: '#EDE5D9',
        surface: '#FFFFFF',
        border: '#E0D4C0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
