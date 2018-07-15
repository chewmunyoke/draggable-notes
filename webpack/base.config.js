const path = require('path');

module.exports = {
	entry: {
		modernizr: path.join(process.cwd(), '/src/modernizr.js'),
		main: [
			path.join(process.cwd(), '/src/main.js'),
			path.join(process.cwd(), '/src/assets/style/main.scss')
		]
	},
	module: {
		rules: [{
			test: /\.vue$/,
			loader: 'vue-loader'
		/*}, {
			test: /\.tsx?$/,
			loader: 'ts-loader',
			exclude: /(node_modules|bower_components)/,
			options: {
				appendTsSuffixTo: [/\.vue$/]
			}*/
		}, {
			test: /\.jsx?$/,
			exclude: /(node_modules|bower_components)/,
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
	}
};
