/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0d0d0f',
          800: '#151518',
          700: '#1f1f24',
        },
        brand: {
          red: '#e50914',
          hover: '#b80710',
        }
      }
    },
  },
  plugins: [],
}