import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { Configuration } from 'webpack';

import { exec } from 'child_process';

import CompressionPlugin from 'compression-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';

const config: Configuration = {
  entry: {
    main: "./src/index.tsx",
  },
  module: {
    rules: [
      {
        exclude: /node_modules\/(?!(@tanstack\/query-core|@tanstack\/react-query|@tanstack\/react-table|@tanstack\/virtual-core)\/).*/,
        test: /\.(ts|tsx|js|jsx)$/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: [
              "@babel/plugin-proposal-nullish-coalescing-operator",
              "@babel/plugin-proposal-optional-chaining",
            ],
            presets: [['@babel/preset-env', { modules: false }], "@babel/preset-react", "@babel/preset-typescript"],
          },
        },
      },
      {
        test: /\.(css|sass|scss)$/,
        use: [MiniCssExtractPlugin.loader, "style-loader", "css-loader"],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
    splitChunks: false,
  },
  output: {
  clean: true, 
  filename: "[name].bundle.js",            
    path: path.resolve(__dirname, "./build"),
  },
  plugins: [
    new CompressionPlugin({
      algorithm: "gzip", 
      minRatio: 0.8,
      test: /\.(js|css|html|svg)$/, 
      threshold: 10240,
    }),
    new MiniCssExtractPlugin({
      chunkFilename: '[id].css', 
      filename: '[name].css', // Output CSS for dynamic chunks
  }),
    new BundleAnalyzerPlugin(),
    new Dotenv({
      path: "../.env",
    }),
    new webpack.HotModuleReplacementPlugin(),
    {
      apply: (compiler) => {
        let isRunning = false; // Prevent concurrent builds
    
        compiler.hooks.afterEmit.tapAsync("AfterEmitPlugin", (compilation, callback) => {
          if (isRunning) {
            return callback();
          }
    
          isRunning = true;
    
          const commands = [
            "make build-styles",
            "make cp-bundle",
          ];
    
          Promise.all(
            commands.map(
              (command) =>
                new Promise((resolve, reject) => {
                  exec(command, (error, stdout, stderr) => {
                    if (error) {
                      console.error(`Makefile execution error: ${error}`);
                      reject(error);
                    }
                    if (stdout) console.log(`Makefile stdout: ${stdout}`);
                    if (stderr) console.error(`Makefile stderr: ${stderr}`);
                    resolve(null);
                  });
                })
            )
          )
            .then(() => {
              isRunning = false;
              callback();
            })
            .catch(() => {
              isRunning = false;
              callback();
            });
        });
      },
    },
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
    fallback: {
      assert: require.resolve("assert"),
    },
  },
};

export default config;

