const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background',
    // content: './src/js/content',
    // devTools: './src/js/devTools',
    // options: './src/js/options',
    // popup: './src/js/popup'
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
    // new VersionFilePlugin({
    //   packageFile: path.resolve(__dirname, '../package.json'),
    //   template: path.resolve(__dirname, '../manifest.json'),
    //   outputFile: path.resolve(__dirname, '../build/dev/manifest.json'),
    // })
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