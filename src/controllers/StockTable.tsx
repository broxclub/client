import React from 'react';
import block from 'bem-cn';
import { IRow, TColumnsDefinition } from '../types/stock';

type TTotals = { [key: string]: string };

export interface IOwnProps {
  caption?: string;
  columns: TColumnsDefinition;
  rows: IRow[];
  totals?: TTotals;
  balance?: string | React.ReactNode;
  stockClient: any;
  portfolioController: any;
  onHeaderCellClick(): void;
  onFooterCellClick(): void;
  onCellClick(): void;
}

interface IState {
  visibleColumns: TColumnsDefinition;
  keys: TColumnsDefinition;
}

const b = block('stock-table');

type TProps = IOwnProps;

class StockTable extends React.PureComponent<TProps, IState> {
  public state: IState = {
    visibleColumns: [],
    keys: [],
  };

  public componentDidMount() {
    const { columns } = this.props;
    this.setState({
      visibleColumns: columns.filter(col => !col.hidden),
      keys: columns.filter(col => col.key),
    });
  }

  public render() {
    const { caption, totals } = this.props;
    return (
      <div className={b()}>
        {caption && this.renderCaption()}
        {this.renderHeader()}
        {this.renderRows()}
        {totals && this.renderTotals(totals)}
      </div>
    );
  }

  private renderCaption() {
    const { caption, balance } = this.props;
    return (
      <div key="table-caption" className={b('caption-header')}>
        <div className={b('caption-text')}>{caption}</div>
        <div className={b('caption-balance')}>{balance}</div>
      </div>
    );
  }

  private renderHeader() {
    const { onHeaderCellClick } = this.props;
    const { visibleColumns } = this.state;
    return (
      <div className={b('header')}>
        {visibleColumns.map((col, index) => {
          const style = col.style || {};
          const className = b('header-cell')
            .mix(b(`header-cell-${col.id}`))
            .mix(`cell-${col.id}`);
          return col.renderHeaderCell ? (
            col.renderHeaderCell.call(this, col, className, b(), index)
          ) : (
            <div key={index} className={className} style={style} onClick={onHeaderCellClick.bind(this, col.id)}>
              {col.caption}
            </div>
          );
        })}
      </div>
    );
  }

  private renderRows() {
    const { rows } = this.props;
    const { visibleColumns } = this.state;
    return rows.map((row, index) => {
      return (
        <div key={index} className={b('row')}>
          {this.renderColumns(visibleColumns, row, index)}
        </div>
      );
    });
  }

  private renderColumns(columns: TColumnsDefinition, row: IRow, rowIndex: number) {
    const { onCellClick } = this.props;
    return columns.map((col, index) => {
      const style = col.style || {};
      const className = b('row-cell')
        .mix(b(`row-cell-${col.id}`))
        .mix(`cell-${col.id}`);

      return col.renderCell ? (
        col.renderCell.call(this, col, row, rowIndex, className, b())
      ) : (
        <div
          key={index}
          className={className}
          style={style}
          onClick={onCellClick.bind(this, { id: col.id, rownum: rowIndex })}
        >
          {row[col.id]}
        </div>
      );
    });
  }

  private renderTotals(totals: TTotals) {
    const { onFooterCellClick } = this.props;
    const { visibleColumns } = this.state;
    return (
      <div className={b('footer')}>
        {visibleColumns.map((col, index) => {
          const style = col.style || {};
          const text = col.id in totals ? totals[col.id] : undefined;
          const className = b('footer-cell', { filled: !!text }).mix(b(`footer-cell-${col.id}`)).mix(`cell-${col.id}`);

          return col.renderFooterCell ? col.renderFooterCell.call(this, col, className, b()) : (
            <div key={index} className={className} style={style} onClick={onFooterCellClick.bind(this, col.id)}>{text}</div>
          )
        })}
      </div>
    );
  }
}

export default StockTable;
