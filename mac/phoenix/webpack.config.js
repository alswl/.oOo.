module.exports = {
  mode: 'development',
  //mode: "production",
  //entry: "./src/phoenix.ts",
  entry: './src/phoenix.ts',
  output: {
    filename: './phoenix.js',
  },

  // Enable sourcemaps for debugging webpack's output.
  //devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },

  // Other options...
};
