import React from 'react';
import ReactDOM from 'react-dom';
import StockLib, { IHooks } from 'classes/StockLib';
import App from 'core/App';
import { PortfolioContainer } from 'features/stock/view/containers';
import { TColumnsDefinition } from 'classes/Securities/helpers';

class PortfolioInstance {
  private readonly lib: StockLib;
  private rootElement: HTMLElement;
  private columns: TColumnsDefinition;
  private portfolioId: number;
  private hooks: IHooks;

  constructor(
    lib: StockLib,
    root: HTMLElement,
    columns: TColumnsDefinition,
    portfolioId: number,
    hooks: IHooks,
  ) {
    this.lib = lib;
    this.portfolioId = portfolioId;
    this.rootElement = root;
    this.columns = columns;
    this.hooks = hooks;
  }

  public render() {
    return ReactDOM.render(
      <App
        api={this.lib.api}
        socket={this.lib.socket}
        hooks={this.hooks}
      >
        <PortfolioContainer
          portfolioId={this.portfolioId}
          columnsDefinition={this.columns}
        />
      </App>, this.rootElement
    );
  }
}

export default PortfolioInstance;
