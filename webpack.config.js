const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: "./src/userscript-main.ts",
	optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: /(\s@|UserScript==)/i,
          },
        }
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
	plugins: [
    new webpack.BannerPlugin({
      banner: fs.readFileSync(path.resolve(__dirname, "src/userscript-main.ts"), "utf-8").replace(/(==\/UserScript==)[\s\S]+$/, "$1"),
      entryOnly: true,
      raw: true
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "script.user.js"
  },
};
