/** @type {import('tailwindcss').Config} */
module.exports = {
  // Purge unused styles in production
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // Enable dark mode based on a class
  darkMode: 'class',
  theme: {
    extend: {
      // ✅ This is where your custom theme is defined
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)', // Main theme color
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        secondary: {
          500: 'var(--color-secondary-500)', // Accent color
        }
      },
      // Use the 'Inter' font family throughout the app
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      // Custom animation for the withdrawal ticker
      animation: {
        marquee: 'marquee 40s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'), // Official plugin for aspect ratio
  ],
}
