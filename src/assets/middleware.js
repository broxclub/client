const StockLibMiddleware = (() => {

  const locale = window.navigator.userLanguage || window.navigator.language;
  moment.locale(locale);

  function capitalize(word) {
    return `${word.slice(0, 1).toUpperCase()}${word.slice(1, word.length).toLowerCase()}`;
  }

  function RowsBuffer(columnsDefinition) {
    const rows = new Map();
    const ids = columnsDefinition.filter(col => col.key).map(col => col.id);
    const getKey = eval(`r => [r.${ids.join(', r.')}].join('-')`);

    return {
      getKey,
      get: (key) => {
        return rows.get(key);
      },
      update: (key, rowsArray) => {
        rows.set(key, rowsArray);
      },
      asArray: () => {
        const res = [];
        for (const rowsArray of Array.from(rows.values())) {
          res.push.apply(res, rowsArray);
        }
        return res;
      }
    }
  }

  function rowsCollapser(rows) {
    const map = new Map();
    const secIds = new Set();
    for (const row of rows) {
      const { SECID, TYPE } = row;
      const id = `${SECID}-${TYPE}`;
      if (map.has(id)) {
        const prevRow = map.get(id);
        const pl = new Decimal(row.PL).plus(prevRow.PL);
        const dealPriceQty = new Decimal(row.DEALPRICEQTY).plus(prevRow.DEALPRICEQTY);
        const plpercent = new Decimal(100).mul(pl).div(dealPriceQty);
        const newRow = {
          ...prevRow,
          LOW: row.LOW,
          HIGH: row.HIGH,
          MARKETPRICE: row.MARKETPRICE,
          VOLTODAY: row.VOLTODAY,
          LCURRENTPRICE: row.LCURRENTPRICE,
          YIELD: row.YIELD,
          DEALPRICE_SHOW: row.DEALPRICE_SHOW,
          DEALPRICEQTY: dealPriceQty.toNumber(),
          QUANTITY: new Decimal(row.QUANTITY).plus(prevRow.QUANTITY).toNumber(),
          PL: pl.toFixed(2),
          PLPERCENT: plpercent.toNumber(),
          PLPERCENT_SHOW: `${plpercent.toFixed(2)} %`,
          BPRICE: new Decimal(row.BPRICE).plus(prevRow.BPRICE).toFixed(2),
        };
        map.set(id, newRow);
      } else {
        map.set(id, row);
        secIds.add(SECID);
      }
    }

    // collapse zero sum
    for (const SECID of secIds) {
      const sellId = `${SECID}-sell`;
      const buyId = `${SECID}-buy`;
      const sell = map.get(sellId);
      const buy = map.get(buyId);

      if (buy && sell && buy.QUANTITY - sell.QUANTITY === 0) {
        map.delete(sellId);
        map.delete(buyId);
      }
    }
    return Array.from(map.values());
  }

  function TableSubscription(stockClient, tabHolder, columns, portfolio) {
    // String sort function
    const sortFunc = (rows) => {
      return rows.sort((a, b) => {
        return a.SECID > b.SECID ? 1 : a.SECID < b.SECID ? -1 : 0;
      });
    };

    const controller = {
      refresh: () => {
        update();
      }
    };

    const stockTable = stockClient.tableInstance(tabHolder, columns, portfolio.id, {
      onReloadRequested: () => controller.refresh(),
    });

    const portfolioInstance = stockClient.portfolioInstance(tabHolder, portfolio.id, {
      onReloadRequested: () => controller.refresh(),
    });

    const update = () => {
      stockClient.listPortfolioSecurities(portfolio.id).then(securities => {
        const rowsBuffer = new RowsBuffer(columns);
        const subscription = {};
        for (const sec of securities) {
          const {
            board: boardid, secid, secname, create_at, type, low, high, last, value, closeprice, marketprice,
            voltoday, lcurrentprice, issuecapitalization, yieldtoprevyield, yieldtooffer, yieldlastcoupon, quantity,
            buyprice, pnl
          } = sec;

          if (!subscription[boardid]) {
            subscription[boardid] = [];
          }

          const lCurPriceDecimal = new Decimal(lcurrentprice || 0);
          const isBuy = type.toLowerCase() === 'buy';
          const bpriceDecimal = lCurPriceDecimal.mul(quantity || 0);
          const pnlDecimal = new Decimal(pnl);
          const plpercent = pnlDecimal.mul(100).div(bpriceDecimal);
          const [day, month, year] = moment(create_at).format('D-MMMM-YY').split('-');

          const row = {
            id: sec.id,
            portfolioId: portfolio.id,
            SECID: secid,
            SECNAME: secname,
            DATE: `${day}-${capitalize(month)}-${year}`,
            BOARDID: boardid,
            LOW: low,
            HIGH: high,
            MARKETPRICE: marketprice,
            VOLTODAY: voltoday,
            DEALPRICE_SHOW: `${lcurrentprice > 0 ? '' : '-'}${new Decimal(lcurrentprice).toFixed(2)}`,
            TYPE_SHOW: isBuy ? 'Покупка' : 'Продажа',
            QUANTITY: quantity,
            YIELD: sec['yield'],
            BPRICE: `${isBuy ? bpriceDecimal.toString() : '0'}`,
            DEALPRICE: lCurPriceDecimal.toNumber(),
            BUYPRICE: buyprice,
            TYPE: type,
            PL: pnl,
            PLPERCENT_SHOW: `${plpercent.toFixed(2)}`,
            PLPERCENT: plpercent.toFixed(2),
            LCURRENTPRICE: '',
          };

          const id = rowsBuffer.getKey(row);
          const rowsArray = rowsBuffer.get(id) || [];
          rowsArray.push(row);
          rowsBuffer.update(id, rowsArray);
          subscription[boardid].push(secid);
        }

        const invocationId = stockClient.subscribeMarkets(subscription, buf => {

          for (const row of buf) {
            const id = rowsBuffer.getKey(row);
            const { YIELD } = row;
            const rowsArray = rowsBuffer.get(id);
            const LCURRENTPRICE = row.LCURRENTPRICE || row.WAPRICE;

            const updateRows = rowsArray.map(bufRow => {
              bufRow.LCURRENTPRICE = new Decimal(LCURRENTPRICE).toFixed(2);

              // bufRow.DEALPRICE - цена покупки
              if (bufRow.TYPE === 'buy') {
                const lcurrentprice = new Decimal(LCURRENTPRICE || 0);
                const pl = lcurrentprice.mul(bufRow.QUANTITY).minus(new Decimal(bufRow.DEALPRICE).mul(bufRow.QUANTITY));
                const plpercent = pl.mul(100).div(bufRow.BPRICE);
                const dealPriceQty = new Decimal(bufRow.DEALPRICE).mul(bufRow.QUANTITY);
                const plpercentShow =
                  new Decimal(100)
                    .mul(pl)
                    .div( dealPriceQty );

                bufRow.DEALPRICEQTY = dealPriceQty.toNumber();
                bufRow.BPRICE = lcurrentprice.mul(bufRow.QUANTITY).toFixed(2);
                bufRow.PL = pl.toFixed(2);
                bufRow.PLPERCENT_SHOW = `${plpercentShow.toFixed(2)} %`;
                bufRow.PLPERCENT = plpercentShow.toFixed(2);
                // PL * 100 / BPRICE
              }
              bufRow.YIELD = YIELD;

              return bufRow;
            });

            rowsBuffer.update(id, updateRows);
          }

          const sortedRowsArray = sortFunc(rowsBuffer.asArray());
          const totals = {
            PL: new Decimal(0),
            BPRICE: new Decimal(0),
            PLPERCENT: new Decimal(0),
          };
          sortedRowsArray.map(row => {
            totals.PL = totals.PL.add(row.PL);
            totals.BPRICE = totals.BPRICE.add(row.BPRICE);
            totals.PLPERCENT = totals.PLPERCENT.add(row.PLPERCENT);
          });

          const convertRowsToPlates = (rows) => rows.map(row => ({
            secid: row.SECID,
            secname: row.SECNAME,
            date: row.DATE,
            quantity: row.QUANTITY,
            boardid: row.BOARDID,
            currentprice: row.LCURRENTPRICE,
            dealprice: row.DEALPRICE,
            pl: row.PL,
            plPercent: row.PLPERCENT,
            totalprice: row.BPRICE
          }));

          // 1: PL
          // 2: BPRICE
          // 3: PLPERCENT_SHOW

          // stockTable.render(
          portfolioInstance.render(
            //rowsCollapser(sortedRowsArray),
            convertRowsToPlates(rowsCollapser(sortedRowsArray)),
            portfolio.name,
            `Свободные средства: ${portfolio.balance}`,
            {
              PL: totals.PL.toString(),
              BPRICE: totals.BPRICE.toString(),
              PLPERCENT_SHOW:
                totals.BPRICE
                  .add(portfolio.balance)
                  .mul(100)
                  .div(portfolio.start_balance)
                  .minus(100)
                  .toFixed(2)
            }
          );
        });
      }).catch(e => console.error(e));
    };

    update();

    return controller;
  }

  const isLocalhost = document.domain === 'localhost';

  function renderHeaderCell(col, className, baseClassName, index) {
    const { onHeaderCellClick } = this.props;
    const style = col.style || {};
    return React.createElement(
      'div',
      {
        key: index,
        className,
        style,
        onClick: onHeaderCellClick.bind(this, col.id),
      },
      React.createElement('div', { key: 'caption', className: `${baseClassName}__header-cell-caption` }, col.caption),
      /*[
        React.createElement('div', { key: 'caption', className: `${baseClassName}-header-cell-caption` }, col.caption),
        React.createElement('div', { key: 'id', className: `${baseClassName}-header-cell-id` }, `(${col.id})`),
      ],*/
    )
  }

  function renderPosNegCell(col, row, rowIndex, className, baseClassName) {
    const { onCellClick } = this.props;
    const style = col.style || {};
    const valueColId = col.valueColId || col.id;
    const value = new Decimal(row[valueColId] || 0);
    return React.createElement(
      'div',
      {
        key: `${rowIndex}-${col.id}`,
        className: `${className} ${baseClassName}__row-cell-${value.isNegative() ? 'negative' : 'positive'}`,
        style,
        onClick: onCellClick.bind(this, {id: col.id, rownum: rowIndex}),
      },
      row[col.id]
    );
  }

  function renderFooterPosNegCell(col, className, baseClassName) {
    const { totals, onFooterCellClick } = this.props;
    const style = col.style || {};
    const text = col.id in totals ? totals[col.id] : undefined;
    const valueConverter = col.valueConverter || (value => value);
    const value = new Decimal(text || 0);
    return React.createElement(
      'div',
      {
        key: col.id,
        className: `${className} ${baseClassName}__footer-cell-${value.isNegative() ? 'negative' : 'positive'}`,
        style,
        onClick: onFooterCellClick.bind(this, col.id),
      },
      valueConverter(text)
    );
  }

  const columns = [
    // {
    //  id: 'SECID', // ID for each column
    //  key?: true, // key - does column type is key (must be at least one key! for to collect rows to map)
    //  caption?: 'Column caption', // Column header text
    //  className?: 'column-css-class', // Column class name
    //  style?: { width: '100px' }, // Header/row cell runtime styles
    //  hidden?: false, // does column hidden? may be hidden column with key definition
    //  renderCell?: () => {}, // cell render callback (using if defined)
    //  renderHeaderCell?: () => {} // header cell render callback (using if defined)
    // }
    {id: 'ICO',
      renderCell: (col, row, rowIndex, className) => {
        return React.createElement('div', {
            className,
            style: col.style,
            key: `img-${rowIndex}`,
          },
          React.createElement('img', {
            src: `https://api.brox.club/ICO/${row.SECID}.ico`,
          })
        );
      }
    },

    /*
    {id: 'ACTIONS', caption: 'Действия', style: {width: '120px'},
      renderCell: function (col, row, rowIndex, className) {
        const { stockClient, portfolioController } = this.props;
        return React.createElement('div', {
            className,
            style: col.style,
            key: `actions-${rowIndex}`
          },
          [
            React.createElement('button', {
              key: `actions-${rowIndex}-sell`,
              onClick: () => {
                stockClient.sellSecurity({
                  portfolioid: row.portfolioId,
                  board: row.BOARDID,
                  secid: row.SECID,
                  quantity: 2,
                  price: 100,
                }).then(response => {
                  console.log('Sell success', response);
                  portfolioController.refresh();
                }).catch(e => console.error(e));
              },
            }, 'sell 2 by 100'),
          ]);
      }
    },
    */

    {id: 'SECID', key: true, caption: 'Тикер', className: 'security', renderHeaderCell},
    {id: 'SECNAME', caption: 'Наименование', renderHeaderCell},
    // {id: 'TYPE_SHOW', caption: 'Тип сделки', renderHeaderCell},
    {id: 'DATE', caption: 'Дата сделки', renderHeaderCell},
    {id: 'QUANTITY', caption: 'Кол-во бумаг в портфеле', renderHeaderCell},

    {id: 'DEALPRICE_SHOW', caption: 'Цена сделки', renderHeaderCell},
    {id: 'LCURRENTPRICE', caption: 'Текущая цена', renderHeaderCell},
    {id: 'PL', caption: 'Прибыль/убыток', renderHeaderCell,
      renderCell: renderPosNegCell,
      renderFooterCell: renderFooterPosNegCell,
    },

    {id: 'PLPERCENT_SHOW', caption: '%', renderHeaderCell,
      valueColId: 'PLPERCENT',
      renderCell: renderPosNegCell,
      renderFooterCell: renderFooterPosNegCell,
      valueConverter: (value) => `${value} %`,
    },
    {id: 'BPRICE', caption: 'Цена бумаг в портфеле', renderHeaderCell},

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
