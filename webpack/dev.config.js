const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./base.config.js');

module.exports = merge(common, {
	mode: 'development',
	watch: true,
	devServer: {
		contentBase: 'src',
		historyApiFallback: true
	},
	module: {
		rules: [{
			test: /\.(sa|sc|c)ss$/,
			use: [
				{ loader: 'style-loader', options: { sourceMap: true } },
				{ loader: 'css-loader', options: { sourceMap: true } },
				{ loader: 'postcss-loader',
					options: {
						ident: 'postcss',
						plugins: [
							require('autoprefixer')()
						],
						sourceMap: true
					}
				},
				{ loader: 'sass-loader', options: { sourceMap: true } }
			]
		}]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'src/index.html',
			favicon: 'src/favicon.ico'
		})
	]
});
