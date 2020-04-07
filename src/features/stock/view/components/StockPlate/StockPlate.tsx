import React from 'react';
import block from 'bem-cn';
import { bind } from 'decko';
import { ISecurityPlate } from '../../../namespace';
import Decimal from 'decimal.js';
import { Menu } from 'shared/view/components';
import { Icon, Image } from 'shared/view/elements';

import './StockPlate.scss';

interface IOwnProps {
  security: ISecurityPlate;
  onSellClicked(security: ISecurityPlate): void;
}

interface IState {
  menuIsOpen: boolean;
}

const b = block('stock-plate');

type TProps = IOwnProps;

class StockPlate extends React.PureComponent<TProps, IState> {
  public state: IState = {
    menuIsOpen: false,
  };

  public render() {
    const { security } = this.props;
    const { menuIsOpen } = this.state;
    const plPercent = parseInt(new Decimal(security.plPercent).toFixed(0));
    return (
      <div className={b()}>
        <div className={b('menu')}>
          <Menu
            btn={ (<Icon src={require('shared/view/images/more-horizontal-inline.svg')}/> )}
            isOpen={menuIsOpen}
            onBtnClicked={this.handleMenuBtnClicked}
            onOutsideClicked={this.handleMenuOutsideClicked}
          >
            <div className={b('menu-content')}>
              <div className={b('menu-content-item')} onClick={this.handleSellActionClicked}>Продать</div>
            </div>
          </Menu>
        </div>
        <div className={b('top-row')}>
          <div>
            <div className={b('top-row-secname')}>{security.secname}</div>
            <div className={b('top-row-secid')}>{security.secid}</div>
          </div>
          <div>
            <Image src={`https://api.brox.club/ICO/${security.secid}.ico`}/>
          </div>
        </div>

        <div className={b('row')}>
          <div>
            <div className={b('pl')}>{security.pl} ₽
              <span className={b('pl-percent', {
                negative: plPercent < 0,
                positive: plPercent > 0,
                zero: plPercent === 0,
              })}>
                {plPercent}%
              </span>
            </div>
            <div className={b('caption-text')}>Рост за последний год</div>
          </div>
        </div>

        <div className={b('row')}>
          <div className={b('dealprice')}>
            <div>{security.dealprice} ₽ <span className={b('caption-text')}>за 1 шт.</span></div>
            <div className={b('caption-text')}>Цена сделки</div>
          </div>
          <div>
            <div>Количество: {security.quantity} шт.</div>
            <div className={b('caption-text').mix(b('buy-date'))}>{security.date}</div>
          </div>
        </div>

        <div className={b('row')}>
          <div>
            <div>{security.currentprice} ₽</div>
            <div className={b('caption-text')}>Текущая цена</div>
          </div>
        </div>

        <div className={b('row')}>
          <div>
            <div>{security.totalprice} ₽</div>
            <div className={b('caption-text')}>Цена бумаг в портфеле</div>
          </div>
        </div>

      </div>
    );
  }

  @bind
  private handleSellActionClicked() {
    this.setState({ menuIsOpen: false }, () => {
      this.props.onSellClicked(this.props.security);
    });
  }

  @bind
  private handleMenuBtnClicked() {
    this.setState({ menuIsOpen: true });
  }

  @bind
  private handleMenuOutsideClicked() {
    this.setState({ menuIsOpen: false });
  }
}

export default StockPlate;
