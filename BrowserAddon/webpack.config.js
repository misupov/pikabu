const path = require('path');
const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ExtensionReloader  = require('webpack-extension-reloader');
const ZipPlugin = require('zip-webpack-plugin');
const { name } = require('./package.json');

const sourceDirectory = 'src';
const destinationDirectory = 'dist';

module.exports = (env, argv) => {
  const { mode } = argv;
  const isProduction = mode === 'production';

  return {
    entry: './src/index',

    mode: isProduction ? 'production' : 'development',

    devtool: isProduction ? undefined : 'inline-source-map',

    plugins: [
      // new CleanWebpackPlugin(),
      new CopyPlugin([
        { from: 'public', to: '.' },
      ]),
      new ExtensionReloader(),
      new ZipPlugin({
        filename: 'web-extension.zip',
      })
    ],

    externals: {},

    output: {
      path: path.resolve(__dirname, destinationDirectory),
      filename: `user-profile.js`,
    },

    optimization: {
      minimizer: [
        new TerserPlugin({
          // sourceMap: true, // For source maps in production (may be required depending on the contest rules)
          extractComments: false,
          terserOptions: {
            output: {
              comments: false,
            },
          },
        }),
      ],
      minimize: isProduction,
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.resolve(__dirname, 'src'),
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
        },
      ],
    },

    resolve: {
      modules: [sourceDirectory, 'node_modules'],
      extensions: ['.js', '.ts'],
    },
  };
};
