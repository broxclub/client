import * as React from 'react';
import { block } from 'bem-cn';
import InlineSvg from 'svg-inline-react';

import './Icon.scss';

interface IProps {
  className?: string;
  style?: React.CSSProperties;
  src: string;
}

const b = block('icon');

/* tslint:disable:function-name */
function Icon({ className = '', style, src }: IProps) {
  return <InlineSvg src={src} className={b.mix(className)} style={style} />;
}

export default React.memo(Icon);
