import React, { CSSProperties } from 'react';
import block from 'bem-cn';
import { bind } from 'decko';
import { IColumn, TColumnsDefinition } from 'classes/Securities/helpers';
import * as NS from 'features/stock/namespace';
import { Icon, Image } from 'shared/view/elements';
import { TPortfolioTableColumns } from 'features/stock/namespace';
import { numSubClass } from '../../../../../util';
import { Menu } from 'shared/view/components';
import config from 'config/config';
import { ISecurityPlate } from 'features/stock/namespace';

import './PortfolioTable.scss';

interface IOwnProps {
  columnsDefinition: TColumnsDefinition;
  portfolioId: number;
  rows: NS.IStockTableColumnData[];
  onSellClicked(security: ISecurityPlate): void;
}

interface IState {
  visibleColumns: TColumnsDefinition;
  menuOpenRowIndex: number | null;
}

const b = block('portfolio-table');


type TProps = IOwnProps;

class PortfolioTable extends React.PureComponent<TProps, IState> {
  public state: IState = {
    visibleColumns: [],
    menuOpenRowIndex: null,
  };

  private columns: TPortfolioTableColumns = {
    ICO: {
      title: () => '',
      renderCell: (row: NS.IStockTableColumnData, selected: boolean) => {
        return (
          <div className={b('ico')}>
            <Image src={`https://api.brox.club/ICO/${row.SECID}.ico`}/>
          </div>
        );
      },
    },
    SECID: {
      title: () => 'Тикер',
      renderCell: (row: NS.IStockTableColumnData, selected: boolean) => {
        return row.SECID;
      },
    },
    SECNAME: {
      title: () => 'Наименование',
      renderCell: (row: NS.IStockTableColumnData, selected: boolean) => {
        return row.SECNAME;
      },
    },
    DATE: {
      title: () => 'Дата сделки',
      renderCell: (row: NS.IStockTableColumnData, selected: boolean) => {
        return row.DATE;
      },
      width: 100,
    },
    QUANTITY: {
      title: () => 'Кол-во бумаг в портфеле',
      renderCell: (row: NS.IStockTableColumnData, selected: boolean) => {
        return (
          <div className={b('cell', { number: true })}>
            {row.QUANTITY}
          </div>
        );
      },
      width: 150,
    },
    DEALPRICE_SHOW: {
      title: () => 'Цена сделки',
      renderCell: (row: NS.IStockTableColumnData, selected: boolean) => {
        return (
          <div className={b('cell', { number: true })}>
            {row.DEALPRICE_SHOW}
          </div>
        );
      },
      width: 100,
    },
    LCURRENTPRICE: {
      title: () => 'Текущая цена',
      renderCell: (row: NS.IStockTableColumnData, selected: boolean) => {
        return (
          <div className={b('cell', { number: true })}>
            {row.LCURRENTPRICE}
          </div>
        );
      },
      width: 100,
    },
    PL: {
      title: () => 'Прибыль/убыток',
      renderCell: (row: NS.IStockTableColumnData, selected: boolean) => {
        return (
          <div className={b('cell', { number: true, [numSubClass(+row.PL)]: true })}>
            {row.PL}
          </div>
        );
      },
      width: 130,
    },
    PLPERCENT_SHOW: {
      title: () => '%',
      renderCell: (row: NS.IStockTableColumnData, selected: boolean) => {
        return (
          <div className={b('cell', { number: true, [numSubClass(+row.PLPERCENT)]: true })}>
            {row.PLPERCENT_SHOW}
          </div>
        );
      },
      width: 100,
    },
    BPRICE: {
      title: () => 'Цена бумаг в портфеле',
      renderCell: (row: NS.IStockTableColumnData, selected: boolean) => {
        return (
          <div className={b('cell', { number: true })}>
            {row.BPRICE}
          </div>
        );
      },
      width: 150,
    },
  };

  public componentDidMount() {
    const { columnsDefinition } = this.props;
    this.setState({ visibleColumns: columnsDefinition.filter(col => !col.hidden) });
  }

  public render() {
    return (
      <div className={b()} role="table">
        <table cellPadding={0} cellSpacing={0}>
          {this.renderHeader()}
          {this.renderBody()}
        </table>
      </div>
    );
  }

  @bind
  private renderHeader() {
    const { visibleColumns } = this.state;

    return (
      <thead className={b('head')} role="rowgroup">
        <tr>
          {visibleColumns.map((col: IColumn, index: number) => {
            const column = (this.columns as any)[col.id];

            return (
              <th key={`col${index}`}>
                <div key={col.id} className={b('head-cell')} role="columnheader" style={{
                  // flex: `0 0 ${column.width}px`,
                }}>
                  {column.title()}
                </div>
              </th>
            );
          })}
          <th/>
        </tr>
      </thead>
    );
  }

  @bind()
  private renderBody() {
    const { rows } = this.props;
    return (
      <tbody>
        {rows.map(this.renderRow)}
      </tbody>
    );
  }

  @bind
  private renderRow(row: NS.IStockTableColumnData, index: number) {
    const { visibleColumns, menuOpenRowIndex } = this.state;
    return (
      <tr className={b('body-row')} key={`${row.BOARDID}-${row.SECID}`}>
        {visibleColumns.map((col: IColumn, index: number) => {
          const column = (this.columns as any)[col.id];

          const style: CSSProperties = {};
          if (column.width) {
            style.width = `${column.width}px`;
          }

          return (
            <td key={`col${index}`}>
              <div key={col.id} className={b('body-row-cell')} role="cell" style={style}>
                {column.renderCell(row, false)}
              </div>
            </td>
          );
        })}
        <td key={`actions`}>
          <div className={b('body-row-cell')} style={{
            width: '40px',
          }}>
            <Menu
              btn={ (<Icon src={require('shared/view/images/more-inline.svg')}/> )}
              isOpen={menuOpenRowIndex === index}
              onBtnClicked={this.handleMenuBtnClicked.bind(this, index)}
              onOutsideClicked={this.handleMenuOutsideClicked.bind(this, index)}
            >
              <div className={b('menu-content')}>
                <div
                  className={b('menu-content-item', {disabled: !config.isTradeEnabled})}
                  onClick={this.handleBuyActionClicked.bind(this, row)}
                >
                  Продать
                </div>
              </div>
            </Menu>
          </div>
        </td>
      </tr>
    );
  }

  @bind
  private handleMenuBtnClicked(rowIndex: number) {
    this.setState({ menuOpenRowIndex: rowIndex });
  }

  @bind
  private handleMenuOutsideClicked(index: number) {
    if (this.state.menuOpenRowIndex === index ) {
      this.setState({ menuOpenRowIndex: null });
    }
  }

  @bind()
  private handleBuyActionClicked(row: NS.IStockTableColumnData) {
    if (config.isTradeEnabled) {
      this.props.onSellClicked({
        secid: row.SECID,
        secname: row.SECNAME,
        date: row.DATE,
        quantity: +row.QUANTITY,
        boardid: row.BOARDID,
        currentprice: +row.LCURRENTPRICE,
        dealprice: row.DEALPRICE,
        pl: row.PL,
        plPercent: row.PLPERCENT,
        totalprice: row.BPRICE,
      });
    }
  }
}

export default PortfolioTable;
