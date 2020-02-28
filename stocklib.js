const StockLib = (() => {

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

    const STOCKS = 'stocks';

    function StockClient(url) {
      let ws;
      const channels = new Map();

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
          ws = new WebSocket(`ws://${url}/marketdata`);
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
          getRequest(`//${url}/fields`).then((response) => {
            resolve(response);
          }).catch(reject);
        });
      };

      this.listSecurities = ({fields = [], filter}) => {
        const props = [];
        Array.isArray(fields) && fields.length && props.push(`fields=${fields.join(',')}`);
        filter > '' && typeof filter === 'string' && props.push(`filter=${filter}`);
        return new Promise((resolve, reject) => {
          getRequest(`//${url}/securities`, props).then(response => {
            resolve(response);
          }).catch(reject);
        });
      }
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
          const {columns} = this.props;
          this.setState({
            visibleColumns: columns.filter(col => !col.hidden),
            keys: columns.filter(col => col.key)
          });
        }

        render() {
          return e('div', {
            className: `${baseClassName}`
          }, [
            this._renderHeader(),
            this._renderRows()
          ]);
        }

        _renderHeader() {
          const {onHeaderCellClick} = this.props;
          const {visibleColumns} = this.state;
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

              return col.renderCell ?
                col.renderCell(columns, row, rowIndex) :
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

    function RowsBuffer(columns) {
      const rows = new Map();
      const ids = columns.filter(col => col.key).map(col => col.id);

      const getKey = eval(`r => [r.${ids.join(', r.')}].join('-')`);

      return {
        update: (buf) => {
          for (let i = 0; i < buf.length; i++) {
            const row = buf[i];
            const key = getKey(row);
            rows.set(key, row);
          }
        },
        asArray: (externalSort) => {
          const res = Array.from(rows.values());
          return externalSort ? externalSort(res) : res;
        }
      };
    }

    function StockTable(root, stockClient, queryType, columns, sortFunc) {
      const rowsBuffer = new RowsBuffer(columns);
      const handlers = {
        onHeaderCellClick: () => void 0,
        onCellClick: () => void 0,
      };
      // Init React classes when React available
      const {ReactStockTable} = initClasses();

      invocationId = stockClient.subscribeMarkets(queryType, buf => {

        rowsBuffer.update(buf);
        ReactDOM.render(React.createElement(ReactStockTable, {
          columns,
          rows: rowsBuffer.asArray(sortFunc),
          onHeaderCellClick: (e) => handlers.onHeaderCellClick(e),
          onCellClick: (e) => handlers.onCellClick(e),
        }), root);

      });

      return {
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
