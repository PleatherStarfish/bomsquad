// import { Configuration } from "webpack";
// import Dotenv from "dotenv-webpack";
// import { exec } from "child_process";
// import path from "path";
// import webpack from "webpack";

// const config: Configuration = {
//   entry: "./src/index.tsx",
//   output: {
//     path: path.resolve(__dirname, "./build"), // container path
//     filename: "main.js",
//     clean: true,
//   },
//   module: {
//     rules: [
//       {
//         test: /\.(ts|tsx|js|jsx)$/,
//         exclude: /node_modules\/(?!(@tanstack\/query-core|@tanstack\/react-query|@tanstack\/react-table|@tanstack\/virtual-core)\/).*/,
//         use: {
//           loader: "babel-loader",
//           options: {
//             presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"], // Added TypeScript preset
//             plugins: [
//               "@babel/plugin-proposal-nullish-coalescing-operator",
//               "@babel/plugin-proposal-optional-chaining",
//             ],
//           },
//         },
//       },
//       {
//         test: /\.(css|sass|scss)$/,
//         use: [
//           {
//             loader: "style-loader",
//           },
//           {
//             loader: "css-loader",
//           },
//         ],
//       },
//     ],
//   },
//   resolve: {
//     extensions: [".tsx", ".ts", ".js", ".jsx"], // Added TypeScript extensions
//     fallback: {
//       assert: require.resolve("assert"),
//     },
//   },
//   optimization: {
//     minimize: true,
//   },
//   plugins: [
//     new Dotenv({
//       path: "../.env",
//     }),
//     new webpack.HotModuleReplacementPlugin(),
//     {
//       apply: (compiler) => {
//         compiler.hooks.afterEmit.tap("AfterEmitPlugin", () => {
//           exec("make build-styles", (error, stdout, stderr) => {
//             if (error) {
//               console.error(`Makefile execution error: ${error}`);
//               return;
//             }
//             if (stdout) console.log(`Makefile stdout: ${stdout}`);
//             if (stderr) console.error(`Makefile stderr: ${stderr}`);
//           });
//           exec("make cp-bundle", (error, stdout, stderr) => {
//             if (error) {
//               console.error(`Makefile execution error: ${error}`);
//               return;
//             }
//             if (stdout) console.log(`Makefile stdout: ${stdout}`);
//             if (stderr) console.error(`Makefile stderr: ${stderr}`);
//           });
//         });
//       },
//     },
//   ],
// };

// export default config;

import { Configuration } from "webpack";
import Dotenv from "dotenv-webpack";
import { exec } from "child_process";
import path from "path";
import webpack from "webpack";

const config: Configuration = {
  // Multiple entry points for separate bundles
  entry: {
    main: "./src/index.tsx",
    modules: "./src/modules/index.tsx",
  },
  output: {
    path: path.resolve(__dirname, "./build"), // Output path
    filename: "[name].bundle.js",            // Dynamic filename based on entry name
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules\/(?!(@tanstack\/query-core|@tanstack\/react-query|@tanstack\/react-table|@tanstack\/virtual-core)\/).*/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
            plugins: [
              "@babel/plugin-proposal-nullish-coalescing-operator",
              "@babel/plugin-proposal-optional-chaining",
            ],
          },
        },
      },
      {
        test: /\.(css|sass|scss)$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
    fallback: {
      assert: require.resolve("assert"),
    },
  },
  optimization: {
    minimize: true,
    splitChunks: false,
  },
  plugins: [
    new Dotenv({
      path: "../.env",
    }),
    new webpack.HotModuleReplacementPlugin(),
    {
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
          });
        });
      },
    },
  ],
};

export default config;

