const StockLib = (() => {
  const isSsl = location.protocol.indexOf('https') === 0;

  function rtrim(x) {
    return x.replace(/\W+$/, '');
  }

  const StockClient = (() => {
    const nextCommandId = (() => {
      let commandId = 0;
      return () => ++commandId;
    })();

    const getRequest = (url, params) => {
      const paramsStr = Array.isArray(params) && params.length ? `?${params.join('&')}` : '';

      return new Promise((resolve, reject) => {
        fetch(`${url}${paramsStr}`).then((response) => {
          resolve(response.json());
        }).catch(reject);
      });
    };

    const postRequest = (url, body) => {
      return new Promise((resolve, reject) => {
        const ax = new XMLHttpRequest();
        ax.open('POST', url, true);
        ax.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        ax.onreadystatechange = () => {
          if (ax.readyState === 4) {
            if (ax.status >= 200 && ax.status < 400) {
              resolve(JSON.parse(ax.response));
            } else {
              reject(JSON.parse(ax.response));
            }
          }
        };
        ax.send(JSON.stringify(body));
        /*fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          credentials: 'include',
          redirect: 'follow',
          body: JSON.stringify(body),
        }).then(response => response.json().then(resolve).catch(reject))
          .catch(reject);*/
      });
    };

    const STOCKS = 'stocks';

    function StockClient(url) {
      let ws;
      let useSsl = false;
      if (url.indexOf('http') === 0) {
        if (url.indexOf('https') === 0) {
          useSsl = true;
        }
        url = url.replace(/^https?\:/, '');
      }
      const wsUrl = `ws${useSsl ? 's':''}://${url}`;
      const apiUrl = rtrim(`http${useSsl ? 's':''}://${url}`);

      const channels = new Map();

      const apiRequest = (url, params) => {
        return getRequest(`${apiUrl}${url}`, params);
      };

      const postApiRequest = (url, data) => {
        return postRequest(`${apiUrl}${url}`, data);
      }

      const wsSend = (commandId, command, props) => {
        ws.send(JSON.stringify(props ? [commandId, command, props] : [commandId, command]));
      };

      const sendMessage = (command, props) => {
        if (ws.readyState === 1) {
          const commandId = nextCommandId();
          wsSend(commandId, command, props);
          return commandId;
        }
      };

      this.connect = () => {
        return new Promise((resolve, reject) => {
          ws = new WebSocket(`${wsUrl}/marketdata`);
          ws.onopen = (e) => {
            resolve();
            setInterval(() => {
              wsSend(0, 'ping');
            }, 3000);
          };

          ws.onmessage = (e) => {
            try {
              const [id, command, props] = JSON.parse(e.data);

              switch (command) {
                case STOCKS:
                  if (channels.has(id)) {
                    channels.get(id)(props);
                  }
                  break;
              }
            } catch (e) {
              console.error(e);
            }
          };

          ws.onclose = (e) => {
            if (e.wasClean) {
              console.log('Connection normally closed');
            } else {
              console.log('Connection terminated');
            }
          };
        });
      };

      this.subscribeMarkets = (markets, callback) => {
        const invocationId = sendMessage(STOCKS, markets);
        if (invocationId) {
          channels.set(invocationId, callback);
          return invocationId;
        }
      };

      this.unsubscribe = (invocationId) => {
        if (channels.has(invocationId)) {
          wsSend(invocationId, 'terminate');
          channels.delete(invocationId);
        }
      };

      this.listFields = () => {
        return new Promise((resolve, reject) => {
          apiRequest(`/stock/fields`).then((response) => {
            resolve(response);
          }).catch(reject);
        });
      };

      this.listSecurities = ({fields = [], filter}) => {
        const props = [];
        Array.isArray(fields) && fields.length && props.push(`fields=${fields.join(',')}`);
        filter > '' && typeof filter === 'string' && props.push(`filter=${filter}`);
        return new Promise((resolve, reject) => {
          apiRequest(`/stock/securities`, props).then(response => {
            resolve(response);
          }).catch(reject);
        });
      };

      const checkRequired = (data) => {
        Object.keys(data).map(key => {
          if (!data[key]) {
            throw new Error(`Required parameter ${key} undefined`);
          }
        });
      };

      this.listPortfolios = (portfolioId) => {
        return new Promise((resolve, reject) => {
          apiRequest(`/store/portfolio${portfolioId ? `/${portfolioId}` : ''}`).then(response => {
            resolve(response);
          }).catch(reject);
        });
      };

      this.sellSecurity = ({secid, quantity, price}) => {
        const data = {secid, quantity, price};
        checkRequired(data);
        return postApiRequest(`/store/sell`, data);
      };

      this.buySecurity = ({portfolioid, secid, board, quantity}) => {
        const data = {portfolioid, secid, board, quantity};
        checkRequired(data);
        return postApiRequest(`/store/buy`, data);
      };
    }

    return StockClient;
  })();

  const StockTable = (() => {

    let invocationId;
    const baseClassName = 'stock-table';

    const initClasses = () => {
      const e = React.createElement;

      class ReactStockTable extends React.Component {
        state = {
          visibleColumns: [],
          keys: [],
        };

        constructor(props) {
          super(props);
        }

        componentDidMount() {
          const { columns } = this.props;
          this.setState({
            visibleColumns: columns.filter(col => !col.hidden),
            keys: columns.filter(col => col.key)
          });
        }

        render() {
          return e('div', {
            className: `${baseClassName}`
          }, [
            this.props.caption && this._renderCaption(),
            this._renderHeader(),
            this._renderRows(),
            this._renderTotals(),
          ]);
        }

        _renderCaption() {
          const { caption, balance } = this.props;
          return e(
            'div',
            {key: 'table-caption', className: `${baseClassName}-caption-header`},
            [
              e('div', {key: 'text', className: `${baseClassName}-caption-text`}, caption),
              e('div', {key: 'balance', className: `${baseClassName}-caption-balance`}, balance)
            ]
          );
        }

        _renderHeader() {
          const { onHeaderCellClick } = this.props;
          const { visibleColumns } = this.state;
          return e(
            'div',
            {key: 'header', className: `${baseClassName}-header`},
            visibleColumns.map((col, index) => {
                const style = col.style || {};
                return col.renderHeaderCell ? col.renderHeaderCell(col) :
                  e(
                    'div',
                    {
                      key: index,
                      className: `${baseClassName}-header-cell ${baseClassName}-header-cell-${col.id}`,
                      style,
                      onClick: onHeaderCellClick.bind(this, col.id),
                    },
                    col.caption
                  )
              }
            ));
        }

        _renderTotals() {
          const { totals, onFooterCellClick } = this.props;
          const { visibleColumns } = this.state;
          return e(
            'div',
            {key: 'footer', className: `${baseClassName}-footer`},
            visibleColumns.map((col, index) => {
              const style = col.style || {};
              const text = col.id in totals ? totals[col.id] : undefined;

              return col.renderFooterCell ? col.renderFooterCell(col) :
                e(
                  'div',
                  {
                    key: index,
                    className: `${baseClassName}-footer-cell ${text ? `${baseClassName}-footer-cell-filled ` : ''}${baseClassName}-footer-cell-${col.id}`,
                    style,
                    onClick: onFooterCellClick.bind(this, col.id),
                  },
                  text
                )
            })
          );
        }

        _renderRows() {
          const {rows} = this.props;
          const {visibleColumns} = this.state;
          return rows.map((row, index) =>
            e(
              'div',
              {key: index, className: `${baseClassName}-row`},
              this._renderColumns(visibleColumns, row, index))
          );
        }

        _renderColumns(columns, row, rowIndex) {
          const {onCellClick} = this.props;
          return columns.map((col, index) => {
              const style = col.style || {};
              const className = `${baseClassName}-row-cell ${baseClassName}-row-cell-${col.id}`;

              return col.renderCell ?
                col.renderCell(col, row, rowIndex, className) :
                e(
                  'div',
                  {
                    key: index,
                    className: `${baseClassName}-row-cell ${baseClassName}-row-cell-${col.id}`,
                    style,
                    onClick: onCellClick.bind(this, {id: col.id, rownum: rowIndex}),
                  },
                  row[col.id]
                )
            }
          );
        }
      }

      return {ReactStockTable};
    };

    function StockTable(root, columns) {
      const handlers = {
        onHeaderCellClick: () => void 0,
        onFooterCellClick: () => void 0,
        onCellClick: () => void 0,
      };
      // Init React classes when React available
      const {ReactStockTable} = initClasses();

      const render = (rows, caption, balance, totals) => {
        // rowsBuffer.update(rows);
        ReactDOM.render(React.createElement(ReactStockTable, {
          columns,
          rows,
          totals,
          caption,
          balance,
          // rows: rowsBuffer.asArray(sortFunc),
          onHeaderCellClick: (e) => handlers.onHeaderCellClick(e),
          onFooterCellClick: (e) => handlers.onFooterCellClick(e),
          onCellClick: (e) => handlers.onCellClick(e),
        }), root);
      };

      return {
        render,
        onHeaderCellClick: (handler) => {
          handlers.onHeaderCellClick = handler;
        },
        onCellClick: (handler) => {
          handlers.onCellClick = handler;
        }
      };
    }

    return StockTable;
  })();

  const supportedModes = ['production', 'development'];
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const handleLoad = () => {
        resolve(src);
      };
      const handleReject = (e) => {
        reject(e);
      };

      const d = document.createElement('script');
      d.type = 'text/javascript';
      d.crossorigin = true;
      d.true = false;
      d.onreadystatechange = () => {
        const state = d.readyState;
        if (state === 'complete') {
          handleLoad();
        } else {
          handleReject();
        }
      };
      d.addEventListener('load', handleLoad);
      d.addEventListener('error', handleReject);
      d.src = src;
      document.getElementsByTagName('body')[0].appendChild(d);
    });
  };

  const loadLibs = (mode) => {
    return new Promise((resolve, reject) => {
      if (!window.React) {
        loadScript(`https://unpkg.com/react@16/umd/react.${mode === 'production' ? mode + '.min' : mode}.js`)
          .then(() => {
            return loadScript(`https://unpkg.com/react-dom@16/umd/react-dom.${mode === 'production' ? mode + '.min' : mode}.js`);
          })
          .then(() => {
            return loadScript(`https://unpkg.com/decimal.js/decimal.min.js`);
          })
          .then(resolve)
          .catch(reject);
      } else {
        resolve();
      }
    });
  };

  return {
    Table: StockTable,
    Client: StockClient,
    run: (runMode = 'production') => {
      const mode = runMode.toLowerCase();
      if (supportedModes.indexOf(mode) < 0) {
        throw new Error(`Unsupported mode ${runMode}, available modes is: [${supportedModes.join()}]`);
      }
      return loadLibs(mode);
    },
  };
})();
