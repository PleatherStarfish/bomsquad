const colors = require('tailwindcss/colors');

module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  content: [
    '/Users/danielmiller/dev/BomSquad/backend/*.{html,js}', 
    '/Users/danielmiller/dev/BomSquad/frontend/*.{html,js}', 
    '/Users/danielmiller/dev/BomSquad/backend/**/*.{html,js}', 
    '/Users/danielmiller/dev/BomSquad/frontend/**/*.{html,js}', 
    '/Users/danielmiller/dev/BomSquad/backend/**/**/*.{html,js}', 
    '/Users/danielmiller/dev/BomSquad/frontend/**/**/*.{html,js}', 
    '/Users/danielmiller/dev/BomSquad/backend/**/**/**/*.{html,js}', 
    '/Users/danielmiller/dev/BomSquad/frontend/**/**/*.{html,js}',
    '/Users/danielmiller/dev/BomSquad/frontend/**/**/**/*.{html,js}'
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        black: colors.black,
        white: colors.white,
        gray: colors.gray,
        red: colors.red,
        indigo: colors.indigo,
        blue: colors.blue,
        brandgreen: {
          '50':  '#f7faf6',
          '100': '#ecf3ea',
          '200': '#cde5cc',
          '300': '#aed7ae',
          '400': '#6fc980',
          '500': '#548a6a',
          '600': '#4c7e5e',
          '700': '#406a4c',
          '800': '#32533a',
          '900': '#264429',
        }
      },
    },
  },
  variants: {},
  plugins: [],
};
