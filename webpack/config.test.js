const nodeExternals = require('webpack-node-externals');
const path = require('path');

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
            include: path.resolve(__dirname, '../tests'),
            use: 
            {
                loader: 'babel-loader',
                options: {
                    presets: [ "@babel/preset-env", {}]
                }
            }
        }]
    }
};