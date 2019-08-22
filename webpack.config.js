const path = require("path");
const argv = require("yargs").argv;

/*plugins
=====================================*/
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    index: "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: '[name].[hash].js',
    publicPath: "/"
  },

  devtool: "source-map",

  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("babel-loader"),
            options: {
              cacheDirectory: true,
            }
          }
        ]
      },
      {
        test: /\.(css|scss)?$/,
        exclude: /node_modules/,
        use: [
          argv.mode !== "production" ? 'style-loader' : MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ]
      }
    ]
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: argv.mode === "production" ? "css/[name].[contenthash].css" : "[name].css",
      chunkFilename: "[name].css",
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/index.html",
      minify: argv.mode === "production",
    }),
    new CleanWebpackPlugin({
      verbose: true,
      dry: false
    }),
    new ErrorOverlayPlugin()
  ],

  devServer: {
    contentBase: "./public",
    compress: true,
    port: 1234,
    host: "localhost",
    historyApiFallback: true,
  },

  resolve: {
    extensions: [".js"]
  }
};
