/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        brand: ['Sora', 'sans-serif'],
        heading: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Surfaces
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        // Text
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        // Borders
        'border-color': 'var(--border-color)',
        'border-hover': 'var(--border-hover)',
        // Brand
        'brand-primary': 'var(--brand-primary)',
        'brand-primary-hover': 'var(--brand-primary-hover)',
        'brand-primary-light': 'var(--brand-primary-light)',
        'brand-secondary': 'var(--brand-secondary)',
        'brand-accent': 'var(--brand-accent)',
        'brand-accent-hover': 'var(--brand-accent-hover)',
        // Panels & toolbar
        'panel-bg': 'var(--panel-bg)',
        'panel-border': 'var(--panel-border)',
        'toolbar-bg': 'var(--toolbar-bg)',
        'toolbar-border': 'var(--toolbar-border)',
        'toolbar-button-hover': 'var(--toolbar-button-hover)',
      },
      borderRadius: {
        btn: '8px',
        card: '12px',
        modal: '16px',
        input: '12px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        modal: '0 25px 50px rgba(0,0,0,0.25)',
        node: '0 2px 8px rgba(0,0,0,0.08)',
        'node-hover': '0 4px 16px rgba(0,0,0,0.12)',
        panel: '-4px 0 24px rgba(0,0,0,0.08)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease forwards',
        'fade-in': 'fade-in 0.3s ease forwards',
        'scale-in': 'scale-in 0.15s ease forwards',
        'slide-in-right': 'slide-in-right 0.3s ease forwards',
      },
    },
  },
  plugins: [],
};
