import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FAC10C',
          gold: '#F5BA00',
          yellowLight: '#FFF8E6',
          dark: '#1F262F',
          darker: '#12161C',
          surface: '#181E26',
          card: '#222A36',
          muted: '#8E9AA8',
          border: '#2E3846',
          success: '#07C160',
          danger: '#EE0A24',
          blue: '#1989FA',
          orange: '#FF976A',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'glow-yellow': '0 0 20px rgba(250, 193, 12, 0.35)',
        'glow-sm': '0 2px 10px rgba(0, 0, 0, 0.1)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
