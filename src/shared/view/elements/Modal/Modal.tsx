import React from 'react';
import block from 'bem-cn';
import { bind } from 'decko';
import ReactModal from 'react-modal';
import Draggable from 'react-draggable';
import { Icon } from 'shared/view/elements/index';

import './Modal.scss';

interface IOwnProps {
  isOpen: boolean;
  title?: React.ReactNode;
  disableCloseButton?: boolean;
  closeTimeout?: number;
  onClose(): void;
}

interface IState {
  isOpen: boolean;
  closing: boolean;
}

const b = block('modal');

type TProps = IOwnProps;

class Modal extends React.PureComponent<TProps, IState> {
  public state: IState = {
    isOpen: false,
    closing: false,
  };

  public componentDidMount() {
    const { isOpen } = this.props;
    this.setState({ isOpen, closing: false });
  }

  public componentDidUpdate({isOpen: prevIsOpen}: TProps) {
    const { isOpen, closeTimeout = 100 } = this.props;
    if (isOpen) {
      this.setState({ isOpen, closing: false });
    } else if (prevIsOpen) {
      this.setState({ closing: true }, () =>
        setTimeout(() => this.setState({ isOpen }), closeTimeout),
      );
    }
  }

  public render() {
    const { disableCloseButton = false, closeTimeout, title } = this.props;
    const { isOpen, closing } = this.state;
    const withHeader = title || !disableCloseButton;

    return (
      <ReactModal
        isOpen={isOpen}
        onRequestClose={this.handleClose}
        className={b()}
        overlayClassName={b('overlay').toString()}
        closeTimeoutMS={closeTimeout}
        ariaHideApp={false}
      >
        <Draggable handle={`.${b('header').toString()}`} bounds={`.${b()}`}>
          <div className={b('content', { closing }).toString()}>
            {withHeader && this.renderHeader()}
            <div className={b('body').toString()}>
              {this.props.children}
            </div>
          </div>
        </Draggable>
      </ReactModal>
    );
  }

  private renderHeader() {
    const { title, disableCloseButton } = this.props;
    return (
      <div className={b('header').toString()}>
        <div className={b('header-caption').toString()}>{title}</div>
        {!disableCloseButton && (
          <div className={b('header-close').toString()}>
            <div onClick={this.handleClose} className={b('header-close-btn')}>
              <Icon className={b('close-btn')} src={require('shared/view/images/close-inline.svg')}/>
            </div>
          </div>
        )}
      </div>
    );
  }

  @bind
  private handleClose() {
    const { closeTimeout } = this.props;
    this.setState({ closing: true },
      () => setTimeout(
        () => this.props.onClose(), closeTimeout
      ));
  }
}

export default Modal;
