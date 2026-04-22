import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — purple to cyan gradient system
        brand: {
          purple: '#7C3AED',
          violet: '#8B5CF6',
          indigo: '#6366F1',
          cyan:   '#06B6D4',
        },
        // Dark background layers
        surface: {
          950: '#0A0A0F',  // Page background
          900: '#111118',  // Card background
          800: '#1A1A24',  // Elevated surface
          700: '#22222F',  // Border color
        }
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],  // Headers
        body:    ['var(--font-dm-sans)', 'sans-serif'],// Body text
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7C3AED, #06B6D4)',
        'gradient-card':  'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.05))',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':   'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
      }
    },
  },
  plugins: [],
};

export default config;
