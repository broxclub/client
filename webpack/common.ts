// https://github.com/TypeStrong/ts-node#help-my-types-are-missing
/// <reference path="../@types/global.d.ts" />
import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import WebpackCdnPlugin from 'webpack-cdn-plugin';
// import HtmlWebpackIncludeAssetsPlugin from 'html-webpack-include-assets-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import postcssReporter from 'postcss-reporter';
import postcssSCSS from 'postcss-scss';
import autoprefixer from 'autoprefixer';
import stylelint from 'stylelint';
import doiuse from 'doiuse';
import { ICustomConfig } from 'config/types/config';

const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
// const DynamicCdnWebpackPlugin = require('dynamic-cdn-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
export const chunkName = isProduction ? 'id' : 'name';
export const chunkHash = process.env.WATCH_MODE ? 'hash' : 'chunkhash';
export const hot = !!process.env.WATCH_MODE;

export let customConfig: ICustomConfig = {};
export const contourConfigFilePath = `${__dirname}/../.config.json`;
try {
  // Loading custom config file
  customConfig = require(contourConfigFilePath);
  console.info(`Config file [${contourConfigFilePath}] loaded`);
} catch (e) {
  console.info(`Config [${contourConfigFilePath}] load failed with error:\n`, e.message);
}

const moduleExt = `${process.env.NODE_ENV}${isProduction ? '.min' : ''}`;

export const commonPlugins: webpack.Plugin[] = [
  new CleanWebpackPlugin(['build'], { root: path.resolve(__dirname, '..') }),
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  new webpack.HashedModuleIdsPlugin(),
  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: 'assets/index.html',
    showErrors: !isProduction,
    inject: false,
    chunksSortMode: sortChunks,
    templateParameters: (compilation: any, assets: any, options: any) => {
      const { publicPath, chunks, js: originalJS, css, manifest } = assets;
      let externalJS = [ ...originalJS ];
      const headJS: string[] = [];
      const bodyJS: string[] = [];
      Object.keys(chunks).map(chunkName => {
        const { entry/*, hash, size, css*/ } = chunks[chunkName];
        externalJS = externalJS.filter(path => path !== entry);
        switch (chunkName) {
          case 'app':
            bodyJS.push(`.${entry}`);
            break;
          default:
            headJS.push(`.${entry}`);
        }
      });

      return {
        bodyJS,
        staticJS: ['./assets/middleware.js'], // Depends on CopyWebpackPlugin
        headJS: externalJS.concat(headJS),
        publicPath,
        chunks,
        css,
        manifest,
      };
    }
  }),
  new CopyWebpackPlugin([
    { from: `assets/*.js` }
  ]),
  /*new DynamicCdnWebpackPlugin({
    only: ['react', 'react-dom', 'decimal.js', 'moment'],
    resolver: (moduleName: string, version: string, options: any) => {
      console.table({moduleName, version});
      console.log('options: ', options);
      // console.log(`[[moduleName]]: moduleName`);

      return {
        name: moduleName,
        // var: modules[moduleName].var,
        // url,
        version
      };
    },
    verbose: true,
  }),*/
  new WebpackCdnPlugin({
    modules: [
      { name: 'react', var: 'React', path: `umd/react.${moduleExt}.js` },
      { name: 'react-dom', var: 'ReactDOM', path: `umd/react-dom.${moduleExt}.js` },
      { name: 'moment', path: 'min/moment.min.js' },
      { name: 'decimal.js', var: 'Decimal', path: `decimal${isProduction ? '.min' : ''}.js` },
      // { name: 'moment', var: 'moment', path: `umd/moment.${process.env.NODE_ENV}.min.js` },
      // { name: 'react', var: 'React', path: `umd/react.${process.env.NODE_ENV}.min.js` },
      // { name: 'react-dom', var: 'ReactDOM', path: `umd/react-dom.${process.env.NODE_ENV}.min.js` }
    ],
    // prod: true,
    // prod: process.env.NODE_ENV === 'production',
    publicPath: '/node_modules'
  }),
  /*new HtmlWebpackIncludeAssetsPlugin({
    assets: [`./assets/middleware.js`],
    append: true,
  }),*/
  new ForkTsCheckerWebpackPlugin({
    checkSyntacticErrors: true,
    async: true,
    tsconfig: path.resolve('./tsconfig.json'),
    tslint: path.resolve('./tslint.json'),
  }),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.NODE_ENV_MODE': JSON.stringify(process.env.NODE_ENV_MODE),
    'process.env.CUSTOM_CONFIG': JSON.stringify(customConfig || {}),
  }),
];

if (!!customConfig.enableWebpackProgressOutput) {
  commonPlugins.unshift(
    new SimpleProgressWebpackPlugin({
      format: 'mimimal',
    }),
  );
}

export const commonRules: webpack.RuleSetRule[] = [
  {
    test: /\.(ts|tsx)$/,
    use: ([] as any[]).concat(hot ? 'react-hot-loader/webpack' : []).concat([
      'cache-loader',
      {
        loader: 'thread-loader',
        options: {
          workers: require('os').cpus().length - 1,
          poolTimeout: hot ? Infinity : 2000,
        },
      },
      {
        loader: 'ts-loader',
        options: {
          happyPackMode: true,
          transpileOnly: true,
          experimentalWatchApi: true,
          logLevel: 'error',
        },
      },
    ]),
  },
  {
    test: /\.(ttf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
    use: 'file-loader?name=fonts/[hash].[ext]',
  },
  {
    test: /-inline\.svg$/,
    loader: 'svg-inline-loader',
  },
  {
    test: /\.(png|svg|jpg)/,
    exclude: [/(-inline\.svg)/],
    oneOf: [
      {
        use: {
          loader: 'url-loader',
          options: {
            name: 'images/[name].[ext]',
            limit: 10000,
            fallback: 'file-loader',
          },
        },
      },
    ],
  },
];

export const commonScssLoaders: webpack.Loader[] = [
  {
    loader: 'css-loader',
    options: {
      importLoaders: 2,
      modules: false,
      camelCase: true,
      localIdentName: '',
    },
  },
  {
    loader: 'postcss-loader',
    options: {
      plugins: () => {
        return [
          autoprefixer({
            browsers: ['last 2 versions'],
          }),
        ];
      },
    },
  },
  { loader: 'sass-loader', options: {} },
  {
    loader: 'postcss-loader',
    options: {
      syntax: postcssSCSS,
      plugins: () => {
        return [
          stylelint(),
          doiuse({
            browsers: ['ie >= 11', 'last 2 versions'],
            ignore: ['flexbox', 'rem', 'outline', 'viewport-units'],
            ignoreFiles: ['**/normalize.css'],
          }),
          postcssReporter({
            clearReportedMessages: true,
            throwError: true,
          }),
        ];
      },
    },
  },
];

const associated = new Set(['lodash', 'redux-devtools-extension', 'moment', 'core-js']);

export const commonConfig: webpack.Configuration = {
  target: 'web',
  context: path.resolve(__dirname, '..', 'src'),
  output: {
    // publicPath: './',
    sourceMapFilename: `js/[${chunkName}]-[${chunkHash}].bundle.map`,
    path: path.resolve(__dirname, '..', 'build'),
    filename: `js/[name]-[${chunkHash}].bundle.js`,
    chunkFilename: `js/[${chunkName}]-[${chunkHash}].bundle.js`,
    globalObject: 'this',
  },
  externals: {
  },
  resolve: {
    modules: ['node_modules', 'src'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      'react-dom': '@hot-loader/react-dom'
    },
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

            const bundleName: string = associated.has(packageName) ? 'vendor-isolated' : 'vendor-pack';

            // npm package names are URL-safe, but some servers don't like @ symbols
            // return `npm.${packageName.replace('@', '')}`;
            return bundleName.replace('@', '');
          }
        }
      }
    },
    runtimeChunk: {
      name: 'manifest',
    },
    minimize: false,
  },
  stats: {
    assets: false,
    hash: false,
    chunks: false,
    entrypoints: false,
    publicPath: false,
    children: false,
    modules: false,
    warningsFilter: /export .* was not found in/, // TODO: delete when ts-loader will be updated
  },
};

function sortChunks(a: any, b: any) {
  const order = ['app', 'shared', 'vendor', 'manifest'];
  return order.indexOf(a.names[0]) - order.indexOf(b.names[0]);
}
