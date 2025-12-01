/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#ffe5eb',
          DEFAULT: '#e11d48',
          dark: '#be123c',
        },
        accent: '#2563eb',
      },
      boxShadow: {
        card: '0 20px 40px rgba(15, 23, 42, 0.08)',
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

