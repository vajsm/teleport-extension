const { merge } = require('webpack-merge');
const path = require('path');
const config = require('./config.base.js');

module.exports = merge(config, {
    mode: 'development',
    output: {
        path: path.resolve(__dirname, '../dist/dev')
    },
    devtool: 'inline-source-map',
    watch: true,
    watchOptions: {
        ignored: "node_modules",
        poll: true
    },
});