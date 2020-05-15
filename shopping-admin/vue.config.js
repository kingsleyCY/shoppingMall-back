module.exports = {
  devServer: {
    proxy: {
      '/shop': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/admin/': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    },
    overlay: {
      warnings: false,
      errors: false
    },
  },
  lintOnSave: false
}