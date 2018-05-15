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
			test: /\.(eot|svg|otf|ttf|woff|woff2|jpe?g|png|gif)$/,
			loader: 'file-loader'
		}, {
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
			test: /\.vue$/,
			loader: 'vue-loader'
		}, {
			test: /\.js$/,
			exclude: /(node_modules|bowel_components)/,
			loader: 'babel-loader',
		}]
	},
	plugins: [
		new CleanWebpackPlugin(['build'])
	]
};
