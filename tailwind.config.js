/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      fontFamily: {
        display: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
        body: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f7f7f6',
          100: '#e9e9e6',
          500: '#6b6b66',
          900: '#1a1a18',
        },
        court: {
          wood: '#c9954a',
          line: '#f5f5f2',
          net: '#2d2d2b',
        },
        star: {
          rose: '#d49797',
        },
      },
    },
  },
  plugins: [],
};
