

module.exports = {
  entry: {
    index: './index.js',
  },

  output: {
    path: __dirname + '/public',
    filename: '[name].bundle.js',
  },

  plugins: [
  ],

  module: {
    loaders: [
      { test: /\.jsx?$/, loader: 'babel?cacheDirectory', exclude: /node_modules/ },
      { test: /\.json$/, loader: 'json' }
    ]
  }
};