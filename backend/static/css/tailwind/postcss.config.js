module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    plugins: [
      require('cssnano')({
          preset: 'default',
      }),
  ],
  },
}
