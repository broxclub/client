import webpack from 'webpack';
import { commonPlugins, commonScssLoaders, commonRules, commonConfig, hot } from './common';
import { publicPath, devServer } from './devServer';

const rules: webpack.RuleSetRule[] = commonRules.concat([
  {
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
  },
  {
    test: /\.scss$/,
    use: (['style-loader'] as webpack.Loader[]).concat(commonScssLoaders),
  },
]);

const plugins: webpack.Plugin[] = commonPlugins.concat(hot ? new webpack.HotModuleReplacementPlugin() : []);

const devConfig: webpack.Configuration = {
  ...commonConfig,
  plugins,
  output: {
    ...commonConfig.output,
    publicPath: `${publicPath}`,
  },
  devServer: devServer as webpack.Configuration['devServer'],
  mode: 'development',
  watch: hot,
  entry: {
    app: ([] as string[]).concat(hot ? 'react-hot-loader/patch' : []).concat('./index.tsx'),
  },
  module: {
    rules,
  },
  devtool: 'eval',
};

export default devConfig;
