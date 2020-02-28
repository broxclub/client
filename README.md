<h2>Broxclub JavaScript client library</h2>
```html
<script src="/path/to/stocklib.js"></script>
```

```javascript
StockLib.run()
    .then(() => {
      // StockTable application can be runned there (when all libraries loaded)
    })
    .catch(e => console.error(e));
```

```
StockLib.Client(
  url: string, // WebSocket host and port as single string (for example 194.67.91.14:1313)
)
```

```
interface IColumn {
    id: string; // ID for each column
    key?: boolean; // key - does column type is key (must be at least one key! for to collect rows to map)
    caption?: string; // Column header text
    className?: string; // Column class name
    style?: React.Style; // Header/row cell runtime styles
    hidden?: boolean; // does column hidden? may be hidden column with key definition
    renderCell?: (columns: IColumn[], row: any, rowIndex: number) => React.Node; // cell render callback (using if defined)
    renderHeaderCell?: (column: IColumn) => React.Node; // header cell render callback (using if defined)
}
```

```
type ITableColumns = IColumn[];
type IRow = any;  // Data row from API

StockLib.Table(
    domElement: HTMLDomElement, // Reference to DOM element in your HTML page
    client: StockLib.Client, // Connected StockClient instance
    columns: ITableColumns, // Array of columns of type IColumn
    sortFunc?: (rows: IRow[]) => IRow[], // (Optional) external sort (or filter) method for each data upgrade
);
```

```javascript
const tabHolder = document.getElementById("stocklib-tab-container");

const stockClient = new StockLib.Client('194.67.91.14:1313');

stockClient.listFields().then((response) => {
  // response contains all fields on server row model
}).catch(e => console.error(e));

stockClient.listSecurities({
    fields: ['BOARDID', 'SECID', 'ISIN', 'SECNAME'],
    filter: 'SU26232RMFS7'
}).then(response => {
    // response contains all rows founded with filter and contains declared fields (BOARDID, SECID, ISIN, SECNAME)
})

stockClient.connect().then(() => {
  const columns = [
          {id: 'SECID', key: true, caption: 'Security', className: 'security', style: {width: '170px'}},
          {id: 'SHORTNAME', caption: 'Short name', className: 'shortname', style: {width: '100px'}},
          {id: 'SECNAME', caption: 'Security name', className: 'secname', style: {width: '200px'}},
          {id: 'OPEN', caption: 'Open', style: {width: '200px'}},
          {id: 'HIGH', caption: 'High', style: {width: '200px'}},
          {id: 'LOW', caption: 'Low', style: {width: '200px'}},
          {id: 'VALUE', caption: 'Value', style: {width: '200px'}},
          {id: 'BOARDID', key: true, hidden: true}
        ];
  
  // String sort function
    const sortFunc = (rows) => {
      return rows.sort((a, b) => {
        return a.SECID > b.SECID ? 1 : a.SECID < b.SECID ? -1 : 0;
      });
    };
  
  const stockTable = new StockLib.Table(tabHolder, stockClient, currentType, columns, sortFunc);
  stockTable.onHeaderCellClick((e) => {
    // Click on column header event handler    
  });
  
  stockTable.onCellClick((e) => {
    // Click on cell event handler
  });
});
```
