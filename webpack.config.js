const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
	entry: ['./src/main.js', './src/assets/style/main.scss'],
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
			test: /\.vue$/,
			loader: 'vue-loader'
		}, {
			test: /\.jsx?$/,
			exclude: /node_modules/,
			loader: 'babel-loader'
		}, {
			test: /\.(eot|svg|otf|ttf|woff|woff2|jpe?g|png|gif)$/,
			loader: 'file-loader'
		}]
	},
	resolve: {
		extensions: ['.ts', '.js', '.vue', '.json'],
		alias: {
			'vue$': 'vue/dist/vue.esm.js'
		}
	},
	plugins: [
		new CleanWebpackPlugin(['build'])
	]
};
