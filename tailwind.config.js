/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          light: '#6366F1',
          dark: '#4338CA',
        },
        secondary: {
          DEFAULT: '#64748B',
          light: '#94A3B8',
          dark: '#475569',
        },
        accent: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        background: {
          DEFAULT: '#F8FAFC',
          dark: '#F1F5F9',
          darker: '#E2E8F0',
        },
        'chat-bubble': {
          sent: {
            DEFAULT: '#4F46E5',
            light: '#6366F1',
          },
          received: {
            DEFAULT: '#F1F5F9',
            dark: '#E2E8F0',
          },
        },
      },
      boxShadow: {
        'chat': '0 2px 4px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.07)',
        'chat-hover': '0 4px 6px rgba(0, 0, 0, 0.07), 0 6px 8px rgba(0, 0, 0, 0.09)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 