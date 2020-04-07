import React from 'react';
import ReactDOM from 'react-dom';
import StockLib, { IHooks } from 'classes/StockLib';
import App from 'core/App';
import { default as PortfolioContainer, IOwnProps as IPortfolioProps }
  from 'features/stock/view/containers/PortfolioController/PortfolioContainer';

class PortfolioInstance {
  private readonly lib: StockLib;
  private rootElement: HTMLElement;
  private portfolioId: number;
  private hooks: IHooks;

  constructor(
    lib: StockLib,
    root: HTMLElement,
    portfolioId: number,
    hooks: IHooks,
  ) {
    this.lib = lib;
    this.portfolioId = portfolioId;
    this.rootElement = root;
    this.hooks = hooks;
  }

  public render(
    plates: IPortfolioProps['plates'],
    caption: IPortfolioProps['caption'],
    balance: IPortfolioProps['balance'],
    totals: IPortfolioProps['totals']
  ) {
    return ReactDOM.render(
      <App
        api={this.lib.api}
        hooks={this.hooks}
      >
        <PortfolioContainer
          portfolioId={this.portfolioId}
          plates={plates}
          hooks={this.hooks}
          caption={caption}
          balance={balance}
          totals={totals}
        />
      </App>, this.rootElement
    );
  }
}

export default PortfolioInstance;
