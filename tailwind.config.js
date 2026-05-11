/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          bg: '#FFFFFF',
          card: '#FFFFFF',
          blue: '#000000',  // Changed to black
          red: '#000000',   // Changed to black
          green: '#000000', // Changed to black
          orange: '#000000', // Changed to black
          gray: '#8E8E93',
          dark: '#1C1C1E',
          light: '#F2F2F7',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}