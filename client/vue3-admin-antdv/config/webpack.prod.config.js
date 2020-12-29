const path = require('path');
const webpack = require('webpack');
const {VueLoaderPlugin} = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    app: './src/app.ts'
  },
  output: {
    path: path.join(__dirname, '..', '/dist'),
    publicPath: '/',
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[id].[contenthash:8].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/env', {targets: {node: 6}}]],
            plugins: ['lodash']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: path.join(__dirname, '..', '/dist')
            },
          },
          'css-loader',
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            css: 'vue-style-loader!css-loader',
            less: 'vue-style-loader!css-loader!less-loader'
          },
          postLoaders: {
            html: 'babel-loader'
          }
        }
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: path.join(__dirname, '..', '/dist')
            },
          },
          'css-loader',
          'less-loader'
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          appendTsxSuffixTo: [/\.vue$/]
        }
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      vue: '@vue/runtime-dom'
    }
  },
  optimization: {
    minimize: true,
    usedExports: true,
    concatenateModules: true,
    minimizer: [
      new TerserPlugin({
        test: /\.js$/ig,
        exclude: /node_modules/ig,
        parallel: 4,
        extractComments: false,
        terserOptions: {
          output: {
            beautify: false,
            comments: false,
          },
          compress: {
            booleans: true,
            warnings: false,
            drop_console: true,
            drop_debugger: true,
            reduce_vars: true
          }
        }
      }),
      new OptimizeCSSAssetsPlugin({
        assetNameRegExp: /\.css$/ig,
        cssProcessor: require('cssnano'),
        cssProcessorPluginOptions: {
          preset: ['default', {discardComments: {removeAll: true}}],
        },
        canPrint: true
      }),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 1,
      minChunks: 1,
      maxAsyncRequests: 6,
      maxInitialRequests: 4,
      automaticNameDelimiter: '.',
      cacheGroups: {
        defaultVendors: {
          test: /node_modules/ig,
          minChunks: 1,
          priority: 99999,
          reuseExistingChunk: true
        },
        default: {
          minChunks: 1,
          priority: 1,
          reuseExistingChunk: true
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      filename: 'index.html',
      favicon: 'public/logo.png',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      },
      inject: true,
      showErrors: false
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[id].[contenthash:8].css',
      ignoreOrder: true
    }),
    new MomentLocalesPlugin({
      localesToKeep: ['zh-cn'],
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new webpack.optimize.MinChunkSizePlugin({
      minChunkSize: 819200
    })
  ],
  performance: {
    hints: false
  },
  devtool: false
};
