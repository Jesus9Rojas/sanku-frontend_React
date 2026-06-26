/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: '#ffffff',
        section: '#e2eef8',
        card1: 'rgb(218, 64, 64)',
        card2: 'rgb(243, 162, 39)',
        card3: '#4d5ce7',
        card4: '#9829e2',
        input: '#eef2f5',
        primary: '#0056b3',
        'primary-hover': '#004494',
        secondary: '#00897b',
        tercero: '#25bedc',
        cuarto: '#1c4b55',
        accent: '#00a8ff',
        'accent-red': '#e50914', 
        'text-main': '#2c3e50',
        muted: '#6c7a89',
        border: '#e1e8ed'
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        card: '0 5px 20px rgba(0, 86, 179, 0.08)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}