/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial OncoRuta Mujer IA (definida en la especificación)
        marca: {
          50: '#F1EEFF',
          100: '#E4DEFF',
          200: '#C9BEFF',
          300: '#A693FF',
          400: '#8A72FF',
          500: '#6B4EFF', // primario
          600: '#5A3FE0',
          700: '#4A33BA',
        },
        rosa: {
          50: '#FFF0F3',
          100: '#FFE0E7',
          300: '#FBA9BC',
          500: '#F76C8C', // secundario
          600: '#E14E72',
        },
        crema: '#FFF8F2',
        tinta: '#2E2E2E',
        exito: '#2EAD6B',
        precaucion: '#F2B705',
        riesgo: '#D64545',
        ayuda: '#2F80ED',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        suave: '0 10px 30px -12px rgba(107, 78, 255, 0.18)',
        tarjeta: '0 2px 14px -6px rgba(46, 46, 46, 0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulso: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.12)', opacity: '0.75' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'slide-in': 'slide-in 0.3s ease-out both',
        pulso: 'pulso 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
