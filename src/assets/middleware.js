const StockLibMiddleware = (() => {

  const locale = window.navigator.userLanguage || window.navigator.language;
  moment.locale(locale);

  function TableSubscription(stockClient, tabHolder, columns, portfolio) {

    const portfolioInstance = stockClient.portfolioInstance(tabHolder, columns, portfolio.id, {
      onReloadRequested: () => null,
    });

    if (portfolioInstance) {
      portfolioInstance.render();
    }
  }

  const isLocalhost = document.domain === 'localhost';

  const columns = [
    {id: 'ICO', },
    {id: 'SECID', key: true, caption: 'Тикер'},
    {id: 'SECNAME', caption: 'Наименование'},

    {id: 'DATE', caption: 'Дата сделки'},
    {id: 'QUANTITY', caption: 'Кол-во бумаг в портфеле'},

    {id: 'DEALPRICE_SHOW', caption: 'Цена сделки'},
    {id: 'LCURRENTPRICE', caption: 'Текущая цена'},
    {id: 'PL', caption: 'Прибыль/убыток'},

    {id: 'PLPERCENT_SHOW', caption: '%'},
    {id: 'BPRICE', caption: 'Цена бумаг в портфеле'},

    // {id: 'LOW', caption: 'Мин. цена', style: {width: '100px'}},
    // {id: 'HIGH', caption: 'Макс. цена', style: {width: '100px'}},
    // {id: 'MARKETPRICE', caption: 'Рын. цена', style: {width: '100px'}},
    // {id: 'VOLTODAY', caption: 'Объём', style: { width: '100px' }},
    // {id: 'YIELD', caption: 'Дивиденд', style: {width: '100px'}},

    {id: 'BOARDID', key: true, hidden: true},
    {id: 'DEALPRICE', hidden: true},
    {id: 'TYPE', hidden: true},
    {id: 'PLPERCENT', hidden: true}
  ];

  let currentPortfolios = [];
  const subscriptions = {};

  return async () => {
    const stockClient = new StockLib(isLocalhost ? 'http://localhost:1313' : 'https://api.brox.club');
    await stockClient.connect();

    return {
      listPortfolios: async (portfolioId) => {
        const portfolios = await stockClient.listPortfolios(portfolioId);
        if (portfolioId) {
          currentPortfolios = {
            [portfolioId]: portfolios,
          }
        } else {
          currentPortfolios = portfolios.reduce((acc, portfolio) => {
            acc[portfolio.id] = portfolio;
            return acc;
          }, {});
        }
        return currentPortfolios;
      },
      renderPortfolioToDom: (portfolioId, domElement) => {
        const subscriptionId = new TableSubscription(stockClient, domElement, columns, currentPortfolios[portfolioId]);
        return subscriptions[subscriptionId] = subscriptionId;
      },
      unsubscribe: (subscriptionId) => {
        if (subscriptionId in subscriptions) {
          subscriptions[subscriptionId].unsubscribe();
        }
      }
    };
  };

})();
