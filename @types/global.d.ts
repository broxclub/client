interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?(): any;
}

declare var __DISABLE_SSR__: boolean;
declare var __SERVER__: boolean;
declare var __CLIENT__: boolean;

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.scss';
declare module '*.png';

declare module 'postcss-pxtorem';
declare module 'postcss-reporter';
declare module 'postcss-scss';
declare module 'stylelint';
declare module 'doiuse';
declare module 'svg-inline-react';
declare module 'html-webpack-plugin';
declare module 'fork-ts-checker-webpack-plugin';
declare module 'html-webpack-include-assets-plugin';
declare module 'webpack-cdn-plugin';
declare module 'clean-webpack-plugin';
declare module 'autoprefixer';
