import * as React from 'react';
import block from 'bem-cn';

// import Icon from '../Icon/Icon';
import './Checkbox.scss';

const b = block('checkbox');

interface IProps extends Omit<React.HTMLProps<HTMLInputElement>, 'label'> {
  label?: React.ReactNode;
}

/* tslint:disable:function-name */
function Checkbox(props: IProps) {
  const { checked = false, disabled = false, label, tabIndex, ...rest } = props;
  return (
    <label className={b({ checked, disabled }).toString()}>
      <input
        className={b('fake-input').toString()}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        {...rest}
      />
      <div className={b('input').toString()} tabIndex={tabIndex}>
        {checked && <div className={b('checked-box')}/>}
        {/*{checked && <Icon className={b('check').toString()} src={require('./img/check-inline.svg')} />}*/}
      </div>
      {label && <div className={b('label').toString()}>{label}</div>}
    </label>
  );
}

export { IProps as ICheckboxProps };
export default Checkbox;
