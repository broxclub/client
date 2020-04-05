import * as React from 'react';
import { block } from 'bem-cn';
import getDisplayName from 'react-display-name';

import { Preloader } from 'shared/view/elements';

import './Button.scss';

const b = block('button');

export type ButtonSize = 'xsmall' | 'small' | 'medium' | 'large';
export type ButtonColor = 'transparent' | 'light-blue' | 'light-green';

export interface IProps<T> {
  className?: string;
  children?: React.ReactNode;
  size?: ButtonSize;
  color?: ButtonColor;
  isShowPreloader?: boolean;
  roundedBorder?: boolean;
  forwardedRef?: React.Ref<T>;
  isActive?: boolean;
  isFlat?: boolean;
}

export interface IWrappedComponentProps {
  className?: string;
  children?: React.ReactNode;
}

const preloaderSize: {[kind in ButtonSize]: number} = {
  large: 1,
  medium: 0.85,
  small: 0.7,
  xsmall: 0.55,
};

export function styleButton<T, P extends IWrappedComponentProps>(
  WrappedComponent: React.ComponentType<P> | string,
  isPure: boolean = false,
  displayName: string = `StyleButton(${getDisplayName(WrappedComponent)})`,
) {
  /* tslint:disable:function-name */
  function Button({
    size = 'medium',
    color = 'transparent',
    isShowPreloader,
    // iconKind,
    roundedBorder = false,
    className = '',
    forwardedRef,
    isActive = false,
    isFlat = false,
    children,
    ...restProps
  }: IProps<T>) {
    return (
      <WrappedComponent
        className={b({
          size,
          color,
          active: isActive,
          rounded: roundedBorder,
          flat: isFlat,
        }).mix(className)}
        ref={forwardedRef}
        {...(restProps as P)}
      >
        {isShowPreloader ? (
          <Preloader
            className={b('preloader', { visible: isShowPreloader || false})}
            size={preloaderSize[size]}
            type="button"
            position="relative"
            isShow
          />
        ) : children}
      </WrappedComponent>
    );
  }

  const ButtonComponent: React.ComponentType<P & IProps<T>> = isPure ? React.memo(Button) : Button;
  ButtonComponent.displayName = displayName;
  return ButtonComponent;
}

export default styleButton<HTMLButtonElement, JSX.IntrinsicElements['button']>('button', true, 'Button');
export type IButtonProps = JSX.IntrinsicElements['button'] & IProps<HTMLButtonElement>;
export const LinkButton = styleButton<HTMLAnchorElement, JSX.IntrinsicElements['a']>('a', true);

