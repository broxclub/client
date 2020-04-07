import React from 'react';
import block from 'bem-cn';
import { bind } from 'decko';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { ISecurityPlate, TTotals } from '../../../namespace';
import { StockPlate } from '../../components';
import { IHooks } from 'classes/StockLib';
import * as actions from '../../../redux/actions';
import { numSubClass } from '../../../../../util';
import { Menu } from 'shared/view/components';
import { Icon } from 'shared/view/elements';
import config from 'config/config';

import './PortfolioContainer.scss';

export interface IOwnProps {
  caption?: string;
  portfolioId: number;
  plates: ISecurityPlate[];
  totals?: TTotals;
  balance?: string | React.ReactNode;
  hooks: IHooks;
}

interface IActionProps {
  sellSecurityRequest: typeof actions.sellSecurityRequest;
  buySecurityRequest: typeof actions.buySecurityRequest;
}

interface IState {
  menuIsOpen: boolean;
}

const b = block('portfolio-container');

type TProps = IActionProps & IOwnProps;

class PortfolioContainer extends React.PureComponent<TProps, IState> {
  public static mapDispatch(dispatch: Dispatch): IActionProps {
    return bindActionCreators(
      {
        sellSecurityRequest: actions.sellSecurityRequest,
        buySecurityRequest: actions.buySecurityRequest,
      },
      dispatch,
    );
  }

  public state: IState = {
    menuIsOpen: false,
  };

  public render() {
    const { plates, caption, balance, totals = {} } = this.props;
    const { menuIsOpen } = this.state;
    return (
      <div className={b()}>
        <div className={b('header')}>
          <div>{caption}</div>
          <div className={b('balance')}>{balance}</div>

          <div className={b('menu')}>
            <Menu
              btn={ (<Icon src={require('shared/view/images/more-inline.svg')}/> )}
              isOpen={menuIsOpen}
              onBtnClicked={this.handleMenuBtnClicked}
              onOutsideClicked={this.handleMenuOutsideClicked}
            >
              <div className={b('menu-content')}>
                <div className={b('menu-content-item', {disabled: !config.isTradeEnabled})} onClick={this.handleBuyActionClicked}>Купить ценные бумаги</div>
              </div>
            </Menu>
          </div>

        </div>
        <div className={b('totals')}>
          <div>
            <div>
              <span className={b('pl', { [numSubClass(+totals.PL)]: true })}>{totals.PL} ₽</span>
              <span className={b('pl-percent', { [numSubClass(+totals.PLPERCENT_SHOW)]: true })}>
                {totals.PLPERCENT_SHOW} %
              </span>
            </div>
            <div className={b('hint-text')}>Прибыль/убыток</div>
          </div>
          <div>
            <div className={b('bprice')}>{totals.BPRICE} ₽</div>
            <div className={b('hint-text')}>Цена бумаг в портфеле</div>
          </div>
        </div>
        <div className={b('content')}>
          {plates.map((plate, index) => (
            <StockPlate key={`plate${index}`} security={plate} onSellClicked={this.handleSellClicked} />
          ))}
        </div>
      </div>
    );
  }

  @bind
  private handleSellClicked(security: ISecurityPlate) {
    const { portfolioId } = this.props;
    const { currentprice: price, secid, secname, quantity: available, boardid } = security;
    this.props.sellSecurityRequest({
      portfolioId,
      price,
      secid,
      available,
      boardid,
      secname,
    });
  }

  @bind
  private handleBuyActionClicked() {
    this.setState({ menuIsOpen: false }, () => {
      if (config.isTradeEnabled) {
        this.props.buySecurityRequest({
          portfolioId: this.props.portfolioId,
        });
      }
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

export default connect<void, IActionProps>(null, PortfolioContainer.mapDispatch)(PortfolioContainer);
