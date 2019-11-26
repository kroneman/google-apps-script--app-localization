const { join, resolve } = require('path');
const root = resolve(__dirname);
const GasPlugin = require('gas-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  plugins: [
    new GasPlugin({
      comment: false
    }),
    new CopyWebpackPlugin([
      { from: resolve(`.clasp.json`), to: join(root, 'build'), ToType: 'file' },
      { from: resolve(`appsscript.json`), to: join(root, 'build'), ToType: 'file' },
    ]),
  ],
  entry: './src/code.ts',
  devtool: 'none',
  output: {
    filename: 'Code.gs',
    path: join(root, 'build'),
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [root, 'node_modules'],
  }
};