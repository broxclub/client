import React, { ChangeEvent } from 'react';
import block from 'bem-cn';
import { IBuySecurityRow, IPortfolio, ISecuritiy } from 'features/stock/namespace';
import { Button, Icon, InputBase, Error } from 'shared/view/elements';
import { AutoSizer, Column, Index, Table, TableCellProps } from 'react-virtualized';
import { bind } from 'decko';
import { ICommunication } from 'shared/types/redux';
import Decimal from 'decimal.js';

import './BasketForm.scss';

interface IRowProps {
  quantity: string | number;
  price: number;
}

interface IOwnProps {
  securitiesBasket: ISecuritiy[];
  communication: ICommunication;
  portfolio: IPortfolio;
  onBuy(data: IBuySecurityRow[]): void;
}

type TRowsPropContainer = {[key: string]: IRowProps};

interface IState {
  currentBasket: ISecuritiy[];
  rowProps: TRowsPropContainer;
}

const b = block('basket-form');

const secId = (sec: ISecuritiy) => `${sec.SECID}-${sec.BOARDID}`;

type TProps = IOwnProps;

class BasketForm extends React.PureComponent<TProps, IState> {
  public state: IState = {
    currentBasket: [],
    rowProps: {},
  };

  public componentDidMount() {
    const { securitiesBasket } = this.props;
    const rowProps: TRowsPropContainer = securitiesBasket.reduce((acc, sec) => {
      const id = `${sec.SECID}-${sec.BOARDID}`;
      acc[id] = {
        price: sec.LCURRENTPRICE,
        quantity: 1,
      } as IRowProps;
      return acc;
    }, {} as TRowsPropContainer);

    this.setState({
      rowProps,
      currentBasket: this.props.securitiesBasket.map(sec => ({
        ...sec,
        QUANTITY: 1,
        PRICE: sec.LCURRENTPRICE,
      })),
    });
  }

  public render() {
    const { rowProps, currentBasket } = this.state;
    const { communication, portfolio } = this.props;
    const { quantity, price } = this.getTotals(rowProps);
    return (
      <div className={b()}>
        <div className={b('portfolio')}>
          <div className={b('portfolio-cell')}>
            <div className={b('portfolio-cell-title')}>Портфель:</div>
            <div className={b('portfolio-cell-value')}>{portfolio.name}</div>
          </div>
          <div className={b('portfolio-cell', { warn: portfolio.balance < price })}>
            <div className={b('portfolio-cell-title')}>Доступный баланс:</div>
            <div className={b('portfolio-cell-value')}>{portfolio.balance}</div>
            <div className={b('portfolio-cell-warn-section')}>
              Недостаточно средств
            </div>
          </div>
        </div>
        <div className={b('table')}>
          <AutoSizer>
            {({ width, height }) => (
              <Table
                width={width}
                autoHeight
                height={height}
                headerHeight={30}
                rowHeight={25}
                rowGetter={this.rowGetter}
                rowCount={currentBasket.length}
              >
                <Column dataKey="SECID" label="Тикер" width={130}/>
                <Column dataKey="SECNAME" label="Наименование бумаги" width={300}/>
                <Column dataKey="LCURRENTPRICE" label="Цена" width={100}/>
                <Column dataKey="QUANTITY" label="Количество" width={150} cellRenderer={this.renderQuantity}/>
                <Column dataKey="PRICE" label="Стоимость" width={140} cellRenderer={this.renderPrice}/>
                <Column dataKey="ACTIONS" label="Действия" width={100} cellRenderer={this.renderAction}/>
              </Table>
            )}
          </AutoSizer>
        </div>
        <div className={b('totals-row')}>
          <div className={b('totals-row-col')}>
            Общее количество бумаг: {quantity}
          </div>
          <div className={b('totals-row-col')}>
            Общая стоимость: {price}
          </div>
        </div>
        <div className={b('totals-row')}>
          <div className={b('totals-row-col')}>
            Баланс: {portfolio.balance}
          </div>
          <div className={b('totals-row-col')}>
            Предполагаемый остаток: {new Decimal(portfolio.balance - price).toFixed(2)}
          </div>
        </div>

        {communication.error && (
          <div className={b('error')}>
            <Error>{communication.error}</Error>
          </div>
        )}

        <div className={b('actions')}>
          <Button
            color="light-blue"
            size="large"
            disabled={quantity <= 0}
            isShowPreloader={communication.isRequesting}
            onClick={this.handleSendAction}
          >
            Отправить
        </Button>
        </div>
      </div>
    );
  }

  @bind
  private handleSendAction() {
    const { currentBasket, rowProps } = this.state;
    const buyRows = currentBasket
      .filter(sec => {
        const quantity = +rowProps[secId(sec)].quantity;
        return !isNaN(quantity) && quantity > 0;
      })
      .map(sec => ({
      ...sec,
      quantity: rowProps[secId(sec)].quantity,
    } as IBuySecurityRow));

    this.props.onBuy(buyRows);
  }

  @bind
  private getTotals(rowProps: TRowsPropContainer) {
    let totalPrice = 0;
    let totalQuantity = 0;
    for (const prop of Object.values(rowProps)) {
      const { price, quantity } = prop;
      const qtyVal = +quantity;
      totalPrice += price;
      totalQuantity += !isNaN(qtyVal) && qtyVal > 0 ? qtyVal : 0;
    }

    return { price: totalPrice, quantity: totalQuantity };
  }

  @bind
  private rowGetter(info: Index) {
    const { currentBasket } = this.state;
    return currentBasket[info.index];
  }

  @bind
  private renderAction(props: TableCellProps) {
    const { SECID, BOARDID } = props.rowData;
    const id = `${SECID}-${BOARDID}`;
    return (
      <div
        className={b('row-actions')}
        onClick={this.removeSecurity.bind(this, id)}
      >
        <Icon
          className={b('row-actions-trash')}
          src={require('shared/view/images/trash-inline.svg')}
        />
      </div>
    );
  }

  @bind
  private removeSecurity(id: string) {
    const { [id]:_, ...restRowProps } = this.state.rowProps;
    this.setState({
      currentBasket: this.state.currentBasket.filter(sec => {
        const secId = `${sec.SECID}-${sec.BOARDID}`;
        return secId !== id;
      }),
      rowProps: restRowProps,
    });
  }

  @bind
  private renderPrice(props: TableCellProps) {
    const { rowProps } = this.state;
    const { SECID, BOARDID } = props.rowData;
    const id = `${SECID}-${BOARDID}`;
    return (
      <div className={b('row-price')}>
        {rowProps[id].price}
      </div>
    );
  }

  @bind
  private renderQuantity(props: TableCellProps) {
    const { rowIndex, rowData: { SECID, BOARDID } } = props;
    const rowid = `${SECID}-${BOARDID}`;
    const { rowProps } = this.state;

    return (
      <div className={b('row-quantity')}>
        <InputBase
          type="number"
          value={rowProps[rowid].quantity}
          onChange={this.handleQuantityChange.bind(this, rowIndex)}
        />
      </div>
    );
  }

  @bind
  private handleQuantityChange(rowIndex: number, e: ChangeEvent<HTMLInputElement>) {
    const { currentBasket, rowProps } = this.state;
    const { SECID, BOARDID, LCURRENTPRICE } = currentBasket[rowIndex];
    const rowId = `${SECID}-${BOARDID}`;
    const quantity = e.target.value;
    const qval = +quantity;
    const rowProp = {
      ...rowProps[rowId],
      quantity,
      price: !isNaN(qval) && qval >= 0 ? qval * LCURRENTPRICE : 0,
    };
    this.setState({
      rowProps: {
        ...this.state.rowProps,
        [rowId]: rowProp,
      },
    });
  }
}

export default BasketForm;
