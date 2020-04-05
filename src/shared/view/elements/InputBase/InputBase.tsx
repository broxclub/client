import * as React from 'react';
import block from 'bem-cn';

interface IProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  hasIcon?: boolean;
  search?: boolean;
  unit?: string;
  extent?: 'large' | 'middle' | 'small';
  refCallback?: any;
  fieldMixin?: string;
}

const b = block('input-base');

class InputBase extends React.PureComponent<IProps> {
  public render() {
    const {
      id,
      placeholder,
      value,
      type,
      disabled,
      onChange,
      readOnly,
      maxLength,
      error,
      autoFocus,
      onFocus,
      onBlur,
      onKeyDown,
      hasIcon,
      search,
      unit,
      tabIndex,
      refCallback,
      fieldMixin,
      extent = '',
    } = this.props;
    const modificators = {
      extent,
      error: !!error,
      icon: !!hasIcon,
      search: !!search,
      'with-unit': !!unit,
      disabled: !!disabled,
    };

    return (
      <input
        className={b('field', modificators).mix(fieldMixin || '').toString()}
        id={id}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        autoComplete="off"
        type={type}
        onChange={onChange}
        maxLength={maxLength}
        readOnly={readOnly}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        tabIndex={tabIndex}
        ref={refCallback}
        size={40}
        autoFocus={autoFocus}
      />
    );
  }
}

export default InputBase;
export { IProps as IInputBaseProps };
