const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
	entry: ['./src/js/main.js', './src/css/main.scss'],
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'build')
	},
	mode: 'development',
	module: {
		rules: [{
			test: /\.scss$/,
			use: [{
				loader: 'file-loader',
				options: {
					name: 'index.css'
				}
			}, {
				loader: 'extract-loader'
			}, {
				loader: 'css-loader',
				options: {
					minimize: true,
					sourceMap: true
				}
			}, {
				loader: 'postcss-loader',
				options: {
					sourceMap: true
				}
			}, {
				loader: 'sass-loader',
				options: {
					sourceMap: true
				}
			}]
		}, {
			test: /\.js$/,
			exclude: /(node_modules)/,
			use: {
				loader: 'babel-loader'
			}
		}, {
			test: /\.(eot|svg|otf|ttf|woff|woff2|jpe?g|png|gif)$/,
			loader: 'file-loader'
		}]
	},
	plugins: [
		new CleanWebpackPlugin(['build'])
	]
};
