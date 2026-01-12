/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Exact Avito color palette
        'avito': {
          // Primary blue - links, buttons (Авито использует этот синий)
          'blue': '#0078d7',
          'blue-hover': '#006cbe',
          'blue-light': '#e6f3ff',
          
          // Turquoise/Teal - Avito brand color
          'teal': '#00a0a6',
          'teal-hover': '#008f94',
          
          // Green - "Разместить объявление" button
          'green': '#00a86b',
          'green-hover': '#009960',
          'green-light': '#e6f7f0',
          
          // Background colors (Авито использует очень светлый серый)
          'bg': '#f5f5f5',
          'bg-card': '#ffffff',
          'bg-secondary': '#f0f0f0',
          'bg-hover': '#e8e8e8',
          
          // Text colors
          'text': '#1a1a1a',
          'text-secondary': '#6f6f6f',
          'text-muted': '#999999',
          
          // Border colors  
          'border': '#d9d9d9',
          'border-light': '#ebebeb',
          
          // Price color (черный, жирный как у Авито)
          'price': '#000000',
          
          // Status colors
          'danger': '#d32f2f',
          'warning': '#f5a623',
          'success': '#00a86b',
          
          // Special
          'delivery': '#00a0a6',
          'pro': '#7b1fa2',
        },
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'avito': '0 1px 2px rgba(0, 0, 0, 0.06)',
        'avito-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'avito-card': '0 2px 4px rgba(0, 0, 0, 0.04)',
        'avito-modal': '0 12px 40px rgba(0, 0, 0, 0.2)',
        'avito-header': '0 1px 0 rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'avito': '4px',
        'avito-md': '6px',
        'avito-lg': '8px',
        'avito-xl': '12px',
      },
      fontSize: {
        'avito-price': ['20px', { lineHeight: '24px', fontWeight: '700' }],
        'avito-title': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'avito-small': ['13px', { lineHeight: '18px' }],
      },
    },
  },
  plugins: [],
};
