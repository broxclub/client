import React from 'react';
import block from 'bem-cn';
import { bind } from 'decko';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { IPortfolio, ISecurityPlate/*, TTotals*/ } from '../../../namespace';
import { PlatesWeighed,/*, StockPlate*/ } from '../../components';
// import { IHooks } from 'classes/StockLib';
import * as actions from '../../../redux/actions';
import * as selectors from '../../../redux/selectors';
import { numSubClass } from '../../../../../util';
import { Menu } from 'shared/view/components';
import { Icon, Preloader } from 'shared/view/elements';
import { PortfolioTable } from '../../components';
import config from 'config/config';
import { IAppReduxState } from 'shared/types/app';
import { ICommunication } from 'shared/types/redux';
import { TColumnsDefinition, TRow } from 'classes/Securities/helpers';
import { IPortfolioSecurity } from 'shared/types/responses';
import * as NS from 'features/stock/namespace';

import './PortfolioContainer.scss';

export interface IOwnProps {
  portfolioId: number;
  columnsDefinition: TColumnsDefinition;
}

interface IStateProps {
  loadPortfolioCommunication: ICommunication;
  currentPortfolio: IPortfolio | null;
  portfolioSecurities: IPortfolioSecurity[] | null;
  rows: NS.IStockTableColumnData[];
  totals: TRow | null;
  plates: ISecurityPlate[] | null;
}

interface IActionProps {
  sellSecurityRequest: typeof actions.sellSecurityRequest;
  buySecurityRequest: typeof actions.buySecurityRequest;
  loadPortfolioWithSecurities: typeof actions.loadPortfolioWithSecurities;
  subscribeMarkets: typeof actions.subscribeMarkets;
}

interface IState {
  menuIsOpen: boolean;
}

const b = block('portfolio-container');

type TProps = IStateProps & IActionProps & IOwnProps;

class PortfolioContainer extends React.PureComponent<TProps, IState> {
  public static mapStateToProps(state: IAppReduxState): IStateProps {
    return {
      currentPortfolio: selectors.selectCurrentProfile(state),
      loadPortfolioCommunication: selectors.selectCommunication(state, 'loadPortfolioWithSecurities'),
      portfolioSecurities: selectors.selectPortfolioSecurities(state),
      rows: selectors.selectRows(state),
      totals: selectors.selectTotals(state),
      plates: selectors.selectPlates(state),
    };
  }

  public static mapDispatch(dispatch: Dispatch): IActionProps {
    return bindActionCreators(
      {
        sellSecurityRequest: actions.sellSecurityRequest,
        buySecurityRequest: actions.buySecurityRequest,
        loadPortfolioWithSecurities: actions.loadPortfolioWithSecurities,
        subscribeMarkets: actions.subscribeMarkets,
      },
      dispatch,
    );
  }

  public state: IState = {
    menuIsOpen: false,
  };

  public componentDidMount() {
    this.props.loadPortfolioWithSecurities({
      portfolioId: this.props.portfolioId,
      columns: this.props.columnsDefinition,
    });
  }

  public render() {
    const { loadPortfolioCommunication, currentPortfolio } = this.props;
    return (
      <div className={b()}>
        <Preloader isShow={loadPortfolioCommunication.isRequesting} position="relative">
          {currentPortfolio && this.renderContent()}
        </Preloader>
      </div>
    );
  }

  @bind()
  private renderContent() {
    const { totals, plates, rows } = this.props;
    const { balance, name } = this.props.currentPortfolio!;
    const { menuIsOpen } = this.state;

    return (
      <>
        <div className={b('header')}>
          <div>{name}</div>
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
        {totals && this.renderTotals(totals!)}
        {rows && this.renderPortfolioTable(rows)}
        {plates && this.renderPlates(plates!)}
      </>
    );
  }

  @bind
  private renderTotals(totals: TRow) {
    return (
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
    );
  }

  @bind
  private renderPortfolioTable(rows: NS.IStockTableColumnData[]) {
    const { columnsDefinition } = this.props;
    return (
      <div className={b('table')}>
        <PortfolioTable
          columnsDefinition={columnsDefinition}
          portfolioId={this.props.portfolioId}
          onSellClicked={this.handleSellClicked}
          rows={rows}
        />
      </div>
    );
  }

  @bind
  private renderPlates(plates: ISecurityPlate[]) {
    return (
      <div className={b('content')}>
        <PlatesWeighed plates={plates} onSellClicked={this.handleSellClicked}/>
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

export default connect<IStateProps, IActionProps>(
  PortfolioContainer.mapStateToProps,
  PortfolioContainer.mapDispatch
)(PortfolioContainer);
