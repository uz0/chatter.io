const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development', // по идее это потом можно будет удалить

  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,

        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};