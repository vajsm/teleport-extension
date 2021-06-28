const { merge } = require('webpack-merge');
const path = require('path');
const config = require('./config.base.js');

module.exports = merge(config, {
    mode: 'production',
    output: {
        path: path.resolve(__dirname, '../dist/prod')
    },
    watch: false
});

