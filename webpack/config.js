const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background'
  },
  output: {
    filename: './[name].js',
    path: path.resolve(__dirname, '../build/dev'),
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './src' }
    ], {
      ignore: ['js/**/*', 'manifest.json'],
      copyUnmodified: false
    }),
  ],
  watch: true,
  watchOptions: {
    ignored: "node_modules",
    poll: true
  },
  resolve: {
    modules: [ path.join(__dirname, 'src'), 'node_modules' ]
  },
  module: {
    rules: [{
      test: /\.js$/,
      loaders: [ 'babel-loader' ],
      include: path.resolve(__dirname, '../src')
    }]
  }
};