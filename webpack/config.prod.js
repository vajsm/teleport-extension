const { merge } = require('webpack-merge');
const path = require('path');
const config = require('./config.base.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(config, {
    mode: 'production',
    output: {
        path: path.resolve(__dirname, '../dist/prod')
    },
    watch: false,
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: {
                    pure_funcs: ['console.log'],
                    },
                    mangle: true
                }
            })
        ]
    }
});

