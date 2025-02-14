module.exports = {
    module: {
      rules: [
        {
          test: /\.m?js$/,
          resolve: { fullySpecified: false },
          include: /node_modules\/@dotlottie/, // Force Babel to process this module
          use: {
            loader: 'babel-loader',
            options: {
              presets: ["@babel/preset-env"],
              plugins: ["@babel/plugin-proposal-class-properties"]
            }
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.mjs']
    }
  };
  