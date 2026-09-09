/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Mapped to clean, high-contrast light tones
        navy: {
          50: '#0f172a',  // Deep slate heading
          100: '#1e293b', // Slate 800
          200: '#334155', // Slate 700
          300: '#475569', // Slate 600
          400: '#64748b', // Slate 500
          500: '#94a3b8', // Slate 400
          600: '#cbd5e1', // Slate 300
          700: '#e2e8f0', // Slate 200 border
          800: '#f1f5f9', // Slate 100 panel
          850: '#f8fafc', // Slate 50
          900: '#ffffff', // Pure white card
          950: '#f8fafc', // Ultra-clean canvas
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      boxShadow: {
        '2xs': '0 1px 1px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 12px 30px -8px rgba(37, 99, 235, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'card-elevated': '0 20px 35px -10px rgba(15, 23, 42, 0.08), 0 1px 3px 0 rgba(15, 23, 42, 0.03)',
        'glow-sm': '0 0 15px -3px rgba(37, 99, 235, 0.15)',
        'glow-md': '0 0 25px -5px rgba(37, 99, 235, 0.25)',
        'dropdown': '0 10px 25px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient-x': 'gradient-x 8s ease infinite',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(0.98)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      }
    },
  },
  plugins: [],
}
