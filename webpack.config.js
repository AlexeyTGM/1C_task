// var path = require("path");
var _ = require("underscore");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//var webpack = require('webpack');

var BASE_CFG = {
  mode: "development",
  devtool: "inline-source-map",
  plugins: [
    //new webpack.optimize.UglifyJsPlugin(),
    new MiniCssExtractPlugin({
      filename: "frontend.css",
    }),
  ],
  resolve: {
    extensions: [".js", ".ts", ".scss"],
  },
  module: {
    rules: [
      { test: /\.ts(x?)$/, loader: "ts-loader" },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {},
          },
          "css-loader",
          "sass-loader",
        ],
      },
      { test: /\.json$/, loader: "json-loader" },
    ],
  },
};

var BACKEND_CFG = _.extend({}, BASE_CFG, {
  target: "node",
  entry: __dirname + "/source/backend.ts",
  output: {
    path: __dirname + "/server",
    filename: "main.js",
  },
  externals: {
    express: "commonjs express",
    "express-partials": "commonjs express-partials",
    sequelize: "commonjs sequelize",
    "body-parser": "commonjs body-parser",
  },
});

var FRONTEND_CFG = _.extend({}, BASE_CFG, {
  target: "web",
  entry: __dirname + "/source/bootstrap.ts",
  output: {
    path: __dirname + "/public",
    filename: "frontend.js",
  },
});

module.exports = [FRONTEND_CFG, BACKEND_CFG];
