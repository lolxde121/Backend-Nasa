/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0B3D91',       // NASA Deep Blue
          primaryHover: '#082d6b',
          secondary: '#4FA3E0',     // Sky / Water Blue
          accent: '#2BB3A3',        // Turquoise / Teal
          bg: '#F2F7FB',            // Light cool grayish blue
          text: '#0F1F33',          // Dark navy text
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
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
