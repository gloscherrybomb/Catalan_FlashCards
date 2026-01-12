/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B6B',
          50: '#FFF0F0',
          100: '#FFE1E1',
          200: '#FFC4C4',
          300: '#FFA6A6',
          400: '#FF8989',
          500: '#FF6B6B',
          600: '#FF3333',
          700: '#FA0000',
          800: '#C20000',
          900: '#8A0000',
        },
        secondary: {
          DEFAULT: '#4ECDC4',
          50: '#E8FAF8',
          100: '#D6F6F3',
          200: '#B1EEE9',
          300: '#8DE6DE',
          400: '#68DED4',
          500: '#4ECDC4',
          600: '#2DB8AE',
          700: '#228C85',
          800: '#17605C',
          900: '#0C3432',
        },
        accent: {
          DEFAULT: '#FFE66D',
          50: '#FFFEF5',
          100: '#FFFBE0',
          200: '#FFF5B8',
          300: '#FFEF8F',
          400: '#FFE66D',
          500: '#FFDC35',
          600: '#FCD200',
          700: '#C4A300',
          800: '#8C7500',
          900: '#544600',
        },
        success: '#95D5B2',
        warning: '#F9844A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'flip': 'flip 0.6s ease-in-out',
        'confetti': 'confetti 1s ease-out forwards',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(-100px) rotate(720deg)', opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}
