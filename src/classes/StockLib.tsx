import React from 'react';
import ReactDOM from 'react-dom';
import StockTable, { IOwnProps as IStockTableProps } from '../controllers/StockTable';
import StockClient from './StockClient';

export const StockLib = {
  Table: (root: HTMLElement, columns: IStockTableProps['columns'], stockClient: StockClient, portfolioController: any) => {
    const handlers = {
      onHeaderCellClick: () => void 0,
      onFooterCellClick: () => void 0,
      onCellClick: () => void 0,
    };

    const render = (
      rows: IStockTableProps['rows'],
      caption: IStockTableProps['caption'],
      balance: IStockTableProps['balance'],
      totals: IStockTableProps['totals']
    ) => {
      ReactDOM.render(<StockTable
        columns={columns}
        rows={rows}
        totals={totals}
        caption={caption}
        balance={balance}
        stockClient={stockClient}
        portfolioController={portfolioController}
        onHeaderCellClick={handlers.onHeaderCellClick}
        onFooterCellClick={handlers.onFooterCellClick}
        onCellClick={handlers.onCellClick}
      />, root);
    };

    return {
      render,
      onHeaderCellClick: (handler: any) => {
        handlers.onHeaderCellClick = handler;
      },
      onCellClick: (handler: any) => {
        handlers.onCellClick = handler;
      }
    };
  },
  Client: StockClient,
};
