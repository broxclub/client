import React from 'react';
import block from 'bem-cn';
import { bind } from 'decko';
import { Button, Modal, Preloader, Error } from 'shared/view/elements';
import { IBuySecurityRow, ICheckedRows, IPortfolio, ISecuritiy } from '../../../namespace';
import * as actions from '../../../redux/actions';
import { ICommunication } from 'shared/types/redux';

import { bindActionCreators, Dispatch } from 'redux';
import * as selectors from 'features/stock/redux/selectors';
import { IAppReduxState } from 'shared/types/app';
import { connect } from 'react-redux';
import { SecuritiesTable, BasketForm, BuyDone } from '../../components';
import ActiveFilter from 'classes/ActiveFilter';
import * as NS from '../../../namespace';

import './BuyForm.scss';

interface IOwnProps {
  portfolioId: number;
  onBuySuccess(): void;
  onClose(): void;
}

interface IStateProps {
  securities: ISecuritiy[];
  portfolio: IPortfolio | null;
  dataVersion: number;
  loadSecuritiesCommunication: ICommunication;
  buySecuritiesCommunication: ICommunication;
  loadPortfolioCommunication: ICommunication;
}

interface IActionProps {
  reset: typeof actions.reset,
  loadPortfolio: typeof actions.loadPortfolio;
  loadSecurities: typeof actions.loadSecurities;
  buySecurity: typeof actions.buySecurity;
}

interface IState {
  isAllChecked: boolean;
  canBuy: boolean;
  checkedRows: ICheckedRows;
  filteredSecurities: ISecuritiy[];
  securitiesBasket: ISecuritiy[] | null;
  boughtSecurities: IBuySecurityRow[] | null;
  buyDone: boolean;
}

const b = block('buy-form');

type TProps = IActionProps & IStateProps & IOwnProps;

class BuyForm extends React.PureComponent<TProps, IState> {
  public static mapStateToProps(state: IAppReduxState): IStateProps {
    return {
      securities: selectors.selectSecurities(state),
      dataVersion: selectors.selectSecuritiesVersion(state),
      portfolio: selectors.selectPortfolio(state),
      loadSecuritiesCommunication: selectors.selectCommunication(state, 'loadSecurities'),
      buySecuritiesCommunication: selectors.selectCommunication(state, 'buySecurity'),
      loadPortfolioCommunication: selectors.selectCommunication(state, 'loadPortfolio'),
    };
  }

  public static mapDispatch(dispatch: Dispatch): IActionProps {
    return bindActionCreators(
      {
        reset: actions.reset,
        loadPortfolio: actions.loadPortfolio,
        loadSecurities: actions.loadSecurities,
        buySecurity: actions.buySecurity,
      },
      dispatch,
    );
  }

  public state: IState = {
    isAllChecked: false,
    canBuy: false,
    checkedRows: {},
    filteredSecurities: [],
    securitiesBasket: null,
    boughtSecurities: null,
    buyDone: false,
  };

  private activeFilter: ActiveFilter<ISecuritiy> = new ActiveFilter([]);

  public componentDidMount() {
    this.props.loadPortfolio(this.props.portfolioId);
    const securities = this.activeSecurities;
    this.activeFilter = new ActiveFilter<ISecuritiy>(securities);
    this.setState({ filteredSecurities: securities });
    this.props.loadSecurities({
      fields: ['BOARDID', 'SECID', 'ISIN', 'SECNAME', 'LCURRENTPRICE'],
      filter: '',
    });
  }

  public componentDidUpdate({
    dataVersion: prevDataVersion,
    buySecuritiesCommunication: prevBuySecuritiesCommunication,
  }: TProps) {
    const { dataVersion, buySecuritiesCommunication } = this.props;
    if (prevDataVersion != dataVersion) {
      const activeSecurities = this.activeSecurities;
      this.activeFilter = new ActiveFilter<ISecuritiy>(activeSecurities);
      this.setState({ filteredSecurities: activeSecurities });
    }

    if (!prevBuySecuritiesCommunication.isLoaded && buySecuritiesCommunication.isLoaded) {
      this.setState({ buyDone: true }, () => this.props.onBuySuccess());
    }
  }

  public render() {
    return (
      <Modal isOpen title="Покупка бумаг" onClose={this.handleClose}>
        {this.renderContent()}
      </Modal>
    );
  }

  public renderContent() {
    const {
      loadSecuritiesCommunication,
      loadPortfolioCommunication,
      buySecuritiesCommunication,
      dataVersion,
      portfolio,
    } = this.props;
    const {
      isAllChecked,
      checkedRows,
      canBuy,
      filteredSecurities,
      securitiesBasket,
      boughtSecurities,
      buyDone,
    } = this.state;

    if (buyDone) {
      return (
        <BuyDone
          communication={buySecuritiesCommunication}
          boughtRows={boughtSecurities!}
          onClose={this.props.onClose}
        />
      );
    }

    if (portfolio && securitiesBasket) {
      return (
        <BasketForm
          communication={buySecuritiesCommunication}
          securitiesBasket={securitiesBasket}
          portfolio={portfolio}
          onBuy={this.handleBuySecurities}
        />
      );
    }

    return (
      <div className={b()}>
        <Preloader
          isShow={loadSecuritiesCommunication.isRequesting || loadPortfolioCommunication.isRequesting}
          position="relative"
        >
          <div className={b('table-container')}>
            <SecuritiesTable
              securities={filteredSecurities}
              dataVersion={dataVersion}
              isAllChecked={isAllChecked}
              checkedRows={checkedRows}
              onUpdateFilters={this.handleFilterChanged}
              onCheck={this.handleCheck}
              onCheckAll={this.handleSelectAll}
            />
          </div>
        </Preloader>
        {buySecuritiesCommunication.error && (
          <div className={b('error')}>
            <Error>{buySecuritiesCommunication.error}</Error>
          </div>
        )}
        <div className={b('actions')}>
          <Button color="light-blue" size="large" disabled={!canBuy} onClick={this.handleBuyClicked}>
            Купить
          </Button>
        </div>
      </div>
    );
  }

  private get activeSecurities() {
    const { securities } = this.props;
    return securities.filter(sec => sec.LCURRENTPRICE > 0);
  }

  @bind
  private handleBuySecurities(securities: NS.IBuySecurityRow[]) {
    this.setState({ boughtSecurities: securities }, () => {
      this.props.buySecurity({
        securities,
        portfolioId: this.props.portfolioId,
      });
    });
  }

  @bind
  private handleFilterChanged(filter: NS.IFilterSecuritiesForm) {
    this.activeFilter.updateFilter(filter as any, (filteredSecurities: ISecuritiy[]) => {
      this.setState({ filteredSecurities });
    });
  }

  @bind
  private handleSelectAll() {
    this.setState({
      isAllChecked: !this.state.isAllChecked,
      checkedRows: {},
      canBuy: !this.state.isAllChecked,
    });
  }

  @bind
  private handleCheck(secid: string, row: ISecuritiy) {
    const { checkedRows, isAllChecked } = this.state;
    if (secid in checkedRows) {
      const { [secid]: _, ...restCheckedRows } = checkedRows;
      this.setState({
        checkedRows: restCheckedRows,
        canBuy: Object.keys(restCheckedRows).length > 0 || isAllChecked,
      });
    } else {
      this.setState({
        checkedRows: {
          ...checkedRows,
          [secid]: true,
        },
        canBuy: true,
      });
    }
  }

  @bind
  private handleBuyClicked() {
    const { isAllChecked, checkedRows, filteredSecurities } = this.state;
    const buySecurities = filteredSecurities.filter(sec => {
      const secid = `${sec.SECID}-${sec.BOARDID}`;
      const isSelected = checkedRows.hasOwnProperty(secid);
      return isAllChecked ? !isSelected : isSelected;
    });

    this.setState({ securitiesBasket: buySecurities });
  }

  @bind
  private handleClose() {
    this.props.onClose();
  }
}

export default connect<IStateProps, IActionProps, IOwnProps>(BuyForm.mapStateToProps, BuyForm.mapDispatch)(BuyForm);
