import path from 'path';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const ENV = process.env.NODE_ENV || 'development';
const TOKEN = process.env.TOKEN || 'EiSTgKcDDtizc8Xr4Qy9fRZaOqMz3nvA9z6Kmtu0bOPwdpcp0HA';

let config = {
  context: path.join(__dirname, 'src'),
  debug: true,
  entry: [
    './index.js'
  ],
  output: {
    path: path.join(__dirname, 'build/'),
    publicPath: '/',
    filename: 'app.js'
  },
  devtool: 'eval-source-map',
  devServer: {
    contentBase: './src',
    disableHostCheck: true,
    historyApiFallback: true,
    https: true,
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint'
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loaders: ['style', 'css?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]', 'postcss']
      },
      {
        test: /\.css$/,
        exclude: /src/,
        loaders: ['style', 'css']
      },
      {
        test: /\.(jpg|png|ttf|eot|woff|otf|woff2|svg)$/,
        exclude: /node_modules/,
        loader: 'file-loader'
      }
    ]
  },
  postcss: [ autoprefixer({ browsers: ['last 2 versions'] }) ],
  plugins: ([
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new CopyWebpackPlugin([
      {
        from: 'assets', 
        to: 'assets',
      }
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV),
      'process.env.TOKEN': JSON.stringify(TOKEN)
    }),
  ]),
}

if (process.env.NODE_ENV === 'production') {
  config.devtool = 'source-map'
//   config.devServer = {}
//   config.plugins = [
//     new webpack.DefinePlugin({
//       'process.env': {
//         'NODE_ENV': JSON.stringify('production')
//       }
//     })
//   ]
}

export default config
