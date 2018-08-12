var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.common.js');
var path = require('path')
module.exports = webpackMerge(commonConfig, {
    mode: 'development',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: '[id].chunk.js'
    },
    devServer: {
        historyApiFallback: true,
        stats: 'minimal'
    }
});