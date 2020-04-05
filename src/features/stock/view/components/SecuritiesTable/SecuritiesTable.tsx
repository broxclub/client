import React, { ChangeEvent } from 'react';
import block from 'bem-cn';
import { AutoSizer, Column, Index, SortIndicator, Table } from 'react-virtualized';
import { ICheckedRows, ISecuritiy } from 'features/stock/namespace';
import { bind } from 'decko';
import { TableCellProps, TableHeaderProps, TableHeaderRowProps } from 'react-virtualized/dist/es/Table';
import * as NS from '../../../namespace';

import { filterSecuritiesEntry } from 'features/stock/redux/reduxFormEntries';
import { Checkbox, InputBase } from 'shared/view/elements';

import './SecuritiesTable.scss';

interface IOwnProps {
  securities: ISecuritiy[];
  dataVersion: number;
  isAllChecked: boolean;
  checkedRows: ICheckedRows;
  onUpdateFilters(values: NS.IFilterSecuritiesForm): void;
  onCheckAll(): void;
  onCheck(secid: string, row: ISecuritiy): void;
}

interface IState {
  filter: NS.IFilterSecuritiesForm;
}

const b = block('securities-table');

const { fieldNames } = filterSecuritiesEntry;

type TProps = IOwnProps;

class SecuritiesTable extends React.PureComponent<TProps, IState> {
  public state: IState = {
    filter: { isin: '', secid: '', secname: '' },
  };

  public render() {
    const { securities } = this.props;
    return (
      <div className={b()}>
        <AutoSizer>
          {({ width, height }) => (
            <Table
              width={width}
              height={height}
              headerHeight={46}
              rowHeight={30}
              headerRowRenderer={this.renderHeaderRow}
              rowCount={securities.length}
              rowGetter={this.rowGetter}
            >
              <Column
                dataKey={'CHECK'}
                width={50}
                headerRenderer={this.renderCheckHeader}
                cellRenderer={this.renderCheckCell}
                headerClassName={b('header-cell', {CHECK: true}).toString()}
              />
              <Column
                label="Тикер"
                dataKey="SECID"
                width={130}
                headerRenderer={this.renderHeaderCell}
                className={b('cell', {SECID: true}).toString()}
                headerClassName={b('header-cell', {SECID: true}).toString()}
              />
              {/*<Column label="BOARDID" dataKey="BOARDID" width={100} className={b('cell', {BOARDID: true})}/>*/}
              <Column
                label="ISIN"
                dataKey="ISIN"
                width={140}
                headerRenderer={this.renderHeaderCell}
                className={b('cell', {ISIN: true}).toString()}
                headerClassName={b('header-cell', {ISIN: true}).toString()}
              />
              <Column
                label="Наименование"
                dataKey="SECNAME"
                width={300}
                headerRenderer={this.renderHeaderCell}
                className={b('cell', {SECNAME: true}).toString()}
                headerClassName={b('header-cell', {SECNAME: true}).toString()}
              />
              <Column
                label="Цена"
                dataKey="LCURRENTPRICE"
                width={100}
                headerRenderer={this.renderHeaderCell}
                className={b('cell', {LCURRENTPRICE: true}).toString()}
                headerClassName={b('header-cell', {LCURRENTPRICE: true}).toString()}
              />
            </Table>
          )}
        </AutoSizer>
      </div>
    );
  }

  @bind
  private rowGetter(info: Index) {
    const { securities } = this.props;
    return securities[info.index];
  }

  @bind
  private renderCheckCell(props: TableCellProps) {
    const { isAllChecked, checkedRows, onCheck } = this.props;
    const { SECID, BOARDID } = props.rowData;
    const secid = `${SECID}-${BOARDID}`;
    const isSelected = secid in checkedRows;
    const checkboxChecked = isSelected ? !isAllChecked : isAllChecked;
    return (
      <div className={b('row-checkbox')}>
        <Checkbox checked={checkboxChecked} onChange={onCheck.bind(this, secid, props.rowData)}/>
      </div>
    );
  }

  @bind
  private renderCheckHeader(props: TableHeaderProps) {
    const { isAllChecked, onCheckAll } = this.props;
    return (
      <div className={b('header-cell-col', { checkbox: true })}>
        <div className={b('header-cell-col-checkbox')}>
          <Checkbox onChange={onCheckAll} checked={isAllChecked}/>
        </div>
      </div>
    );
  }

  @bind
  private renderHeaderCell(props: TableHeaderProps) {
    const { dataKey, label, sortBy, sortDirection, } = props;

    const showSortIndicator = sortBy === dataKey;
    const className = 'ReactVirtualized__Table__headerTruncatedText';
    const children = [
      <span
        className={className}
        key="label"
        title={typeof label === 'string' ? label : ''}
      >
      {label}
    </span>,
    ];

    if (showSortIndicator) {
      children.push(
        <SortIndicator key="SortIndicator" sortDirection={sortDirection} />,
      );
    }

    return (
      <div className={b('header-cell-col')}>
        <div className={b('header-cell-col-title')}>
          {children}
        </div>
        {dataKey.toLowerCase() in fieldNames && (
          <div className={b('header-cell-col-input')}>
            <InputBase
              onChange={this.handleFieldChanged.bind(this, dataKey.toLowerCase())}
            />
          </div>
        )}
      </div>
    );
  }

  @bind
  private handleFieldChanged(filterName: string, e: ChangeEvent<HTMLInputElement>) {
    const { onUpdateFilters } = this.props;

    this.setState({ filter: {...this.state.filter, [filterName]: e.target.value }}, () => {
      onUpdateFilters(this.state.filter)
    });
  }

  @bind()
  private renderHeaderRow(props: TableHeaderRowProps) {
    const {className, columns, style } = props;
    return (
      <div className={b('header-row').mix(className)} role="row" style={{ ...style, position: 'relative' }}>
        {columns}
      </div>
    );
  }
}

export default SecuritiesTable;
