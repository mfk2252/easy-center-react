/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Dubai', 'Dubai-Regular', 'system-ui', '-apple-system', 'sans-serif'],
        dubai: ['Dubai', 'Dubai-Regular', 'system-ui', '-apple-system', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif'],
        almarai: ['Almarai', 'sans-serif'],
        alexandria: ['Alexandria', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
