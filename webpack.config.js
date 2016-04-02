var webpack = require('webpack');

module.exports = {
  entry: './src/web.js',
  output: {
    path: __dirname,
    filename: 'bundle.web.js'
  },
  module: {
    loaders: [
      {
        test: /.js$/,
        loader: 'babel-loader'
      },
      {
        test: /.json$/,
        loader: 'json-loader'
      }
    ]
  },
  plugins: [new webpack.optimize.UglifyJsPlugin({ minimize: true })]
}
