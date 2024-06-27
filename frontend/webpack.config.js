const path = require("path");
const webpack = require("webpack");
const { exec } = require("child_process");
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "./build"), // container path
    filename: "main.js",
  },
  module: {
    rules: [
      {
        test: /\.js|\.jsx$/,
        exclude: /node_modules\/(?!(\/@tanstack\/query-core|\/@tanstack\/react-query|\/@tanstack\/react-table|\/@tanstack\/virtual-core)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Ensure you have the necessary presets installed
            plugins: ['@babel/plugin-proposal-nullish-coalescing-operator', '@babel/plugin-proposal-optional-chaining'] // Ensure these plugins are installed and configured
          }
        },
      },
      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
  },
  plugins: [
    new Dotenv({
      path: '../.env.prod',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  resolve: {
    fallback: {
      assert: require.resolve('assert'),
    },
  },
};

// Add the AfterEmitPlugin configuration back as it was
module.exports.plugins.push({
  apply: (compiler) => {
    compiler.hooks.afterEmit.tap("AfterEmitPlugin", () => {
      exec("make build-styles", (error, stdout, stderr) => {
        if (error) {
          console.error(`Makefile execution error: ${error}`);
          return;
        }
        if (stdout) console.log(`Makefile stdout: ${stdout}`);
        if (stderr) console.error(`Makefile stderr: ${stderr}`);
      });
      exec("make cp-bundle", (error, stdout, stderr) => {
        if (error) {
          console.error(`Makefile execution error: ${error}`);
          return;
        }
        if (stdout) console.log(`Makefile stdout: ${stdout}`);
        if (stderr) console.error(`Makefile stderr: ${stderr}`);
      })
    });
  },
});
