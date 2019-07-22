const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const ENV = process.env.NODE_ENV || 'development';
const TOKEN = process.env.TOKEN || 'EiSTgKcDDtizc8Xr4Qy9fRZaOqMz3nvA9z6Kmtu0bOPwdpcp0HA';

module.exports = {
  entry: ['@babel/polyfill', './src/index.js'],

  output: {
    filename: '[name].[hash].js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
  },

  devtool: 'eval-source-map',

  devServer: {
    contentBase: path.join(__dirname, 'src'),
    compress: true,
    port: 8080,
    hot: true,
    historyApiFallback: true,
  },

  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
      },

      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,

        use: {
          loader: 'babel-loader',
        },
      },

      {
        test: /\.css$/,

        use: [
          {
            loader: 'style-loader',
          },

          {
            loader: 'css-loader',

            options: {
              modules: {
                mode: 'local',
                localIdentName: '[name]__[local]___[hash:base64:5]',
              },
            },
          },
        ],
      },

      {
        test: /\.(png|jpe?g|gif|ttf|eot|woff|otf|woff2|svg)$/,

        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, 'src/index.html'),
    }),

    new CopyWebpackPlugin([{
      from: path.join(__dirname, 'src/assets'),
      to: path.join(__dirname, 'dist/assets'),
    }]),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV),
      'process.env.TOKEN': JSON.stringify(TOKEN),
    }),
  ],
};
