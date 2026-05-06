import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F0F1A',
        card: '#1A1A2E',
        ink: '#F5F5F5',
        sub: '#8888AA',
        shadow: '#262626',
        accent: {
          yellow: '#FFE500',
          coral: '#FF4D4D',
          green: '#00FF88',
          violet: '#9B5DE5',
          turquoise: '#00D4FF',
          orange: '#FF8C00',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brut: '4px 4px 0px #262626',
        'brut-sm': '2px 2px 0px #262626',
        'brut-lg': '6px 6px 0px #262626',
        'brut-ink': '4px 4px 0px #F5F5F5',
      },
      borderRadius: {
        brut: '12px',
      },
      animation: {
        wiggle: 'wiggle 0.6s ease-in-out',
        bow: 'bow 1.2s ease-in-out',
        dance: 'dance 0.8s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        bow: {
          '0%,100%': { transform: 'rotate(0)' },
          '50%': { transform: 'rotate(20deg) translateY(8px)' },
        },
        dance: {
          '0%,100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-6px) rotate(2deg)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
