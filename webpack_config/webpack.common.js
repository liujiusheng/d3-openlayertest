var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
    entry: {
        // 'vendor': './js/vendor.js',
        'app': './js/main.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        new CopyWebpackPlugin([{ from: './data', to: 'data' },{ from: './images', to: 'images' }])
    ],
    optimization: {
        splitChunks: {
          cacheGroups: {
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all'
            }
          }
        },
        minimize:true
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        }, {
            test: /\.css$/,
            loader: ['style-loader', 'css-loader']
        }, {
            test: /\.(png|jpg|gif)$/,
            loader: 'file-loader',
            options: {
                limit: 100,
                name: 'images/[name].[ext]?[hash]'
            }
        }, {
            test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                limit: 100,
                name: 'fonts/[name].[ext]?[hash]'
            }
        }]
    }
};