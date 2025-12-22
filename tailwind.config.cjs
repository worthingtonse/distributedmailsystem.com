/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'qmail-blue': {
          50: '#e6f1ff',
          100: '#b3d7ff',
          200: '#80bdff',
          300: '#4a90e2',
          400: '#1a73e8',
          500: '#0056b3',
          600: '#003580',
          700: '#001a4d'
        }
      }
    },
  },
  plugins: [],
  // Production optimizations
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './index.html',
      './src/**/*.{js,jsx,ts,tsx}',
    ],
    // Safelist classes that are dynamically generated in your components
    safelist: [
      // Gradient classes from Home.jsx
      'from-red-500',
      'to-orange-500',
      'from-orange-500',
      'to-yellow-500',
      'from-purple-500',
      'to-pink-500',
      'from-cyan-500',
      'to-blue-500',
      'from-blue-500',
      'to-cyan-500',
      'from-green-500',
      'to-emerald-500',
      // QMail blue colors
      'text-qmail-blue-400',
      'text-qmail-blue-500',
      'bg-qmail-blue-400',
      'bg-qmail-blue-500',
      'border-qmail-blue-400',
      'border-qmail-blue-500',
    ],
    options: {
      // Enable tree-shaking of unused styles
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
    },
  },
  // JIT mode for better performance
  mode: process.env.NODE_ENV === 'production' ? 'jit' : undefined,
}