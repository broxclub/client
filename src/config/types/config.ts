export type TContour = 'production' | 'staging' | 'dev';
export type TBuildMode = 'production' | 'dev';

export interface IContourConfig {
  buildMode: TBuildMode;
  publicPath: string;
}

export type TContours = { [key in TContour]: IContourConfig };

export interface ICustomConfig {
  noSSL?: boolean;
  devServerPort?: number;
  enableWebpackProgressOutput?: boolean;

  contours?: TContours;
}
