import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0B3D91',
        // Se conserva la escala sky de Tailwind (sky-50…900) y se redefine DEFAULT con el azul cielo de la marca.
        sky: { ...colors.sky, DEFAULT: '#4FA3E0' },
        mint: '#2BB3A3',
        fog: '#F2F7FB',
        ink: '#0F1F33',
        brand: {
          primary: '#0B3D91',
          primaryHover: '#082d6b',
          secondary: '#4FA3E0',
          accent: '#2BB3A3',
          bg: '#F2F7FB',
          text: '#0F1F33',
          surface: '#FFFFFF',
          muted: '#607289',
          border: '#E1E8F0',
          pill: '#EBF4FC',
          pillText: '#0B3D91',
          pillMuted: '#F0F4F8',
          pillMutedText: '#4A5B73'
        }
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
