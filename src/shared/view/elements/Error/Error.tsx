import * as React from 'react';
import { block } from 'bem-cn';
import { Icon } from 'shared/view/elements';
import './Error.scss';

interface IProps {
  children: React.ReactNode;
  underField?: boolean;
  className?: string;
}

const b = block('error');

/* tslint:disable:function-name */
function Error({ children, underField, className = '' }: IProps) {
  return (
    <div className={b({ 'under-field': !!underField }).mix(className)}>
      {!underField &&
        <Icon className={b('icon')} src={require('shared/view/images/error-circle-outline-inline.svg')}/>
      }
      <span className={b('text')}>{children}</span>
    </div>
  );
}

export { IProps };
export default React.memo(Error);
