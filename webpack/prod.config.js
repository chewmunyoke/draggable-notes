const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HTMLPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const common = require('./base.config.js');

module.exports = merge(common, {
	mode: 'production',
	output: {
		filename: '[name].bundle.[chunkhash].js',
		path: path.join(process.cwd(), '/dist')
	},
	module: {
		rules: [{
			test: /\.(sa|sc|c)ss$/,
			use: ExtractTextPlugin.extract({
				use: [
					{
						loader: 'css-loader',
						options: {
							discardComments: {
								removeAll: true
							}
						}
					}, {
						loader: 'postcss-loader',
						options: {
							ident: 'postcss',
							plugins: [
								require('autoprefixer')()
							]
						}
					},
					'sass-loader'
				]
			})
		}]
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new HTMLPlugin({
			template: 'src/index.html',
			favicon: 'src/favicon.ico'
		}),
		new ExtractTextPlugin('[name].bundle.[chunkhash].css'),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		})
	]
});
