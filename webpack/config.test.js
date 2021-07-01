const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  mode: 'none',
  externals: [nodeExternals()],
  watch: true,
  watchOptions: {
      ignored: "node_modules",
      poll: true
  },
  module: {
    rules: [{
        test: /\.js$/,
        use: 
        {
            loader: 'babel-loader',
            options: {
                presets: [ "@babel/preset-env" ]
            }
        }
    }]
  }
};