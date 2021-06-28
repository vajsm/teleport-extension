// const CopyWebpackPlugin = require('copy-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
    entry: {
        background: './src/background.js'
    },
    output: {
        filename: './src/[name].js',
        clean: true
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                path.resolve(__dirname, "../src/*.html"),
                path.resolve(__dirname, "../src/*.css"),
                path.resolve(__dirname, "../assets/**"),
                path.resolve(__dirname, "../_locales/**"),
                path.resolve(__dirname, "../manifest.json"),
            ],
        })
    ],
    resolve: {
        modules: [ path.join(__dirname, 'src'), 'node_modules' ]
    },
    module: {
        rules: [{
            test: /\.js$/,
            include: path.resolve(__dirname, '../src'),
            use: 
            {
                loader: 'babel-loader',
                options: {
                    presets: [ "@babel/preset-env" ]
                }
            }
        }]
    }
}