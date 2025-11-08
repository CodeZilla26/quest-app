/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        solo: {
          bg: '#0b0f1a',
          card: 'rgba(15,23,42,0.6)',
          indigo: {
            400: '#7c8cf8',
            500: '#6366f1',
            600: '#4f46e5',
            700: '#4338ca',
          },
          purple: {
            500: '#8b5cf6',
            600: '#7c3aed',
          },
          cyan: {
            400: '#22d3ee',
            500: '#06b6d4',
          },
          amber: {
            400: '#f59e0b',
          },
        },
      },
      boxShadow: {
        'glow-indigo': '0 0 20px 2px rgba(99,102,241,0.35)',
        'glow-purple': '0 0 20px 2px rgba(124,58,237,0.35)',
        'glow-cyan': '0 0 16px 2px rgba(6,182,212,0.35)',
        'inner-card': 'inset 0 1px 0 0 rgba(255,255,255,0.04), 0 10px 30px rgba(0,0,0,0.35)'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        float: 'float 4s ease-in-out infinite',
      },
      backgroundImage: {
        'solo-gradient': 'radial-gradient(1000px 600px at -10% -10%, rgba(79,70,229,0.25), transparent 60%), radial-gradient(800px 500px at 120% 10%, rgba(124,58,237,0.2), transparent 60%), radial-gradient(600px 400px at 50% 120%, rgba(6,182,212,0.18), transparent 60%)',
      },
    },
  },
  plugins: [],
};
