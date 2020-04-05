import React from 'react';
import block from 'bem-cn';

import './Label.scss';

interface IOwnProps extends React.LabelHTMLAttributes<HTMLLabelElement> {

}

const b = block('label');

type TProps = IOwnProps;

class Label extends React.Component<TProps> {
  public render() {
    const { className, ...restProps } = this.props;
    return (
      <label className={b.mix(className)} {...restProps}>
        {this.props.children}
      </label>
    );
  }
}

export default Label;
export { IOwnProps as ILabelProps };
