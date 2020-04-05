import React from 'react';
import ReactDOM from 'react-dom';
import { IOwnProps as IStockTableProps, default as StockTable, IHooks } from 'controllers/StockTable';
import App from 'core/App';
import StockLib from 'classes/StockLib';

class StockTableInstance {
  private readonly lib: StockLib;
  private rootElement: HTMLElement;
  private columns: IStockTableProps['columns'];
  private portfolioId: number;
  private hooks: IHooks;
  private handlers = {
    onHeaderCellClick: () => void 0,
    onFooterCellClick: () => void 0,
    onCellClick: () => void 0,
  };

  constructor(
    lib: StockLib,
    root: HTMLElement,
    columns: IStockTableProps['columns'],
    portfolioId: number,
    hooks: IHooks,
  ) {
    this.lib = lib;
    this.portfolioId = portfolioId;
    this.rootElement = root;
    this.columns = columns;
    this.hooks = hooks;
  }

  public render(
    rows: IStockTableProps['rows'],
    caption: IStockTableProps['caption'],
    balance: IStockTableProps['balance'],
    totals: IStockTableProps['totals']
  ) {
    return ReactDOM.render(
      <App
        api={this.lib.api}
      >
        <StockTable
          columns={this.columns}
          portfolioId={this.portfolioId}
          rows={rows}
          totals={totals}
          caption={caption}
          balance={balance}
          hooks={this.hooks}
          onHeaderCellClick={this.handlers.onHeaderCellClick}
          onFooterCellClick={this.handlers.onFooterCellClick}
          onCellClick={this.handlers.onCellClick}
        />
      </App>, this.rootElement);
  }
}

export default StockTableInstance;
