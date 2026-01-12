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
        // Miró-inspired palette
        miro: {
          red: '#E63946',
          yellow: '#FFB800',
          blue: '#1D3557',
          black: '#0D0D0D',
          cream: '#FFF8E7',
          green: '#2A9D8F',
          orange: '#F77F00',
        },
        // Semantic colors mapped to Miró palette
        primary: {
          DEFAULT: '#E63946',
          50: '#FEF2F2',
          100: '#FDE8E8',
          200: '#FACACA',
          300: '#F7A9AB',
          400: '#EF7478',
          500: '#E63946',
          600: '#D32638',
          700: '#B01B2E',
          800: '#8E1928',
          900: '#761A26',
        },
        secondary: {
          DEFAULT: '#2A9D8F',
          50: '#ECFDF9',
          100: '#D1FAF0',
          200: '#A6F4E2',
          300: '#6FE8D0',
          400: '#38D4B9',
          500: '#2A9D8F',
          600: '#1D7A6D',
          700: '#1B6159',
          800: '#1A4E48',
          900: '#1A403C',
        },
        accent: {
          DEFAULT: '#FFB800',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#FFB800',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        canvas: {
          DEFAULT: '#FFF8E7',
          dark: '#0D0D0D',
        },
        ink: {
          DEFAULT: '#1D3557',
          light: '#A8DADC',
        },
        success: '#2A9D8F',
        warning: '#F77F00',
        error: '#E63946',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'blob': '0 25px 50px -12px rgba(230, 57, 70, 0.25), 0 15px 30px -8px rgba(255, 184, 0, 0.15)',
        'blob-hover': '0 30px 60px -12px rgba(230, 57, 70, 0.3), 0 20px 40px -8px rgba(255, 184, 0, 0.2)',
        'card': '0 4px 6px -1px rgba(29, 53, 87, 0.1), 0 2px 4px -2px rgba(29, 53, 87, 0.1)',
        'card-hover': '0 20px 25px -5px rgba(29, 53, 87, 0.1), 0 8px 10px -6px rgba(29, 53, 87, 0.1)',
        'playful': '8px 8px 0px 0px rgba(29, 53, 87, 0.9)',
        'playful-sm': '4px 4px 0px 0px rgba(29, 53, 87, 0.9)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'wiggle-slow': 'wiggle 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-blob': 'pulseBlob 4s ease-in-out infinite',
        'star-burst': 'starBurst 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(3deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseBlob: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        starBurst: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1.5) rotate(180deg)', opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      borderRadius: {
        'blob': '60% 40% 30% 70% / 60% 30% 70% 40%',
        'blob-2': '30% 70% 70% 30% / 30% 30% 70% 70%',
      },
    },
  },
  plugins: [],
}
