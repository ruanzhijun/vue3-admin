const base = require('./webpack.prod.config');

module.exports = Object.assign({}, base, {
  mode: 'development',
  optimization: {},
  plugins: [base.plugins[0], base.plugins[1], base.plugins[2]],
  devServer: {
    host: '127.0.0.1',
    port: 3001,
    historyApiFallback: true,
    disableHostCheck: true,
    compress: true,
    hot: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3002',
        changeOrigin: true
      }
    }
  },
  devtool: 'eval'
});
