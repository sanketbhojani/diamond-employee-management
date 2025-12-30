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
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        },
        secondary: '#8b5cf6',
        success: {
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        danger: {
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'grid-cols-auto-fit',
  ],
}

