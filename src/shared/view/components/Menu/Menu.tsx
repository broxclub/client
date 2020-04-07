import React from 'react';
import ReactDOM from 'react-dom';
import block from 'bem-cn';
import { bind } from 'decko';
import OutsideClickHandler from 'react-outside-click-handler';
import { Manager, Reference, Popper } from 'react-popper';
import * as PopperJS from '@popperjs/core';

interface IOwnProps {
  btn: React.ReactNode;
  isOpen: boolean;
  strategy?: PopperJS.PositioningStrategy;
  placement?: PopperJS.Placement;
  onBtnClicked(): void;
  onOutsideClicked(): void;
}

const b = block('menu');

type TProps = IOwnProps;

class Menu extends React.PureComponent<TProps> {
  public render() {
    const { btn, strategy, placement = 'bottom-start', isOpen } = this.props;
    return (
      <Manager>
        <div className={b()}>
          <Reference>
            {({ ref }) => (
              <div onClick={this.handleMenuBtnClicked} ref={ref}>
                {btn}
              </div>
            )}
          </Reference>
          {ReactDOM.createPortal(
            <Popper placement={placement} strategy={strategy}>
              {({ placement, ref, style }) => {

                if (isOpen) {
                  return (
                    <OutsideClickHandler onOutsideClick={this.props.onOutsideClicked}>
                      <div ref={ref} style={style} data-placement={placement} className={b('container')}>
                        {this.props.children}
                      </div>
                    </OutsideClickHandler>
                  );
                }

                return null;
              }}
            </Popper>,
            document.body,
          )}
        </div>
      </Manager>
    );
  }

  @bind
  private handleMenuBtnClicked(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onBtnClicked();
  }
}

export default Menu;
