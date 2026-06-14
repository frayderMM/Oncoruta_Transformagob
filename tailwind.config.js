/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial INEN — OncoRuta Mujer IA
        marca: {
          50:  '#F0FBFF', // blanco celeste — fondos de pantalla
          100: '#CCEFFE', // celeste muy claro — hover, cards info
          200: '#A8E5F7', // celeste claro — bordes suaves
          300: '#72D0F3', // celeste principal — badges, iconos
          400: '#3AB8E8', // celeste medio — interactivos secundarios
          500: '#03B1EC', // cian celeste INEN — primario (botones, nav)
          600: '#028FC0', // cian oscuro — hover de botones
          700: '#026BB3', // azul institucional — textos fuertes, header
        },
        rosa: {
          50:  '#FFF0F3',
          100: '#FFE0E7',
          300: '#FBA9BC',
          500: '#F76C8C',
          600: '#E14E72',
        },
        crema: '#F0FBFF',   // fondo general — blanco celeste muy suave
        tinta: '#334155',   // gris texto institucional
        exito: '#2EAD6B',
        precaucion: '#F2B705',
        riesgo: '#D64545',
        ayuda: '#026BB3',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      backgroundImage: {
        'inen':      'linear-gradient(90deg, #014B8C 0%, #026BB3 50%, #03B1EC 100%)',
        'inen-v':    'linear-gradient(160deg, #014B8C 0%, #026BB3 55%, #03B1EC 100%)',
        'inen-soft': 'linear-gradient(135deg, #EAF8FF 0%, #B8EAF9 55%, #72D0F3 100%)',
        'inen-btn':  'linear-gradient(90deg, #026BB3 0%, #03B1EC 100%)',
      },
      boxShadow: {
        suave: '0 10px 30px -12px rgba(3, 177, 236, 0.22)',
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
