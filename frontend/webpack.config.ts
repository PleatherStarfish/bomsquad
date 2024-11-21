import { Configuration } from "webpack";
import Dotenv from "dotenv-webpack";
import TerserPlugin from "terser-webpack-plugin";
import { exec } from "child_process";
import path from "path";
import webpack from "webpack";

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
            presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
          },
        },
      },
      {
        test: /\.(css|sass|scss)$/,
        use: ["style-loader", "css-loader"],
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

