module.exports = {
  devServer: {
    proxy: {
      '/shop': {
        target: 'http://192.168.1.102:3000',
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