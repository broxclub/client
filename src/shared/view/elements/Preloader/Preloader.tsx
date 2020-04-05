import * as React from 'react';
import { block } from 'bem-cn';

import { Icon } from '..';

import './Preloader.scss';

interface IProps {
  isShow: boolean;
  caption?: string;
  type?: 'button' | 'default';
  size?: number;
  position?: 'absolute' | 'relative' | 'fixed';
  className?: string;
  children?: React.ReactNode;
}

const b = block('preloader');

const preloaderImg = {
  button: require('./img/button-loader-inline.svg'),
  default: require('./img/loader-inline.svg'),
};

/* tslint:disable:function-name */
function Preloader({
  size = 14,
  type = 'default',
  isShow,
  children,
  position = 'absolute',
  className = '',
  caption,
}: IProps) {
  if (!isShow) {
    return children || null;
  }

  const image = preloaderImg[type];
  return (
    <div className={b({ position }).mix(className)}>
      <Icon src={image} style={{ width: `${size}rem`, height: `${size}rem` }} />
      {/*<div className={b('loader')}>
        <div className={b('loader-one').mix(b('inner'))}/>
        <div className={b('loader-two').mix(b('inner'))}/>
        <div className={b('loader-three').mix(b('inner'))}/>
      </div>*/}
      {caption && <div className={b('caption')}>{caption}</div>}
    </div>
  );
}

export { IProps };
export default React.memo(Preloader as React.FunctionComponent<IProps>);
