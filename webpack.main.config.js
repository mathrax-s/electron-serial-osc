const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'development',  // 開発モード
  entry: './src/main.js',
  target: 'electron-main',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};
