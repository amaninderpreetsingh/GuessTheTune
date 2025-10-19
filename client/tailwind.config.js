/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#121212',
        'secondary-bg': '#1E1E1E',
        'spotify-green': '#1DB954',
        'primary-text': '#FFFFFF',
        'secondary-text': '#B3B3B3',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
