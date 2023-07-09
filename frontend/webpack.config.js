const path = require("path");
const webpack = require("webpack");
const { exec } = require("child_process");

module.exports = {
  entry: "./src/index.js",

  output: {
    path: path.resolve(__dirname, "./build"), // container path
    filename: "main.js",
  },

  module: {
    rules: [
      {
        test: /\.js|.jsx$/,
        exclude: /node_modules/,
        use: "babel-loader",
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
    new webpack.DefinePlugin({
      React: "react",
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || "development"),
      },
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
};

// Re-run the Makefile build-styles command after each build
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
