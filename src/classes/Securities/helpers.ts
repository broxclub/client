import Decimal from 'decimal.js';

export type TRow = { [key: string]: string | number | Decimal };

export interface IColumn {
  id: string;
  key?: boolean;
  caption?: string;
  className?: string;
  hidden?: boolean;
  renderCell?: (col: IColumn, row: TRow, rowIndex: number, className: string) => JSX.Element;
  renderHeaderCell?: (col: IColumn, className: string, baseClassName: string, index: number) => JSX.Element;
  renderFooterCell?: (col: IColumn, className: string, baseClassName: string) => JSX.Element;
}

export type TColumnsDefinition = IColumn[];

export class RowsBuffer {
  public getKey: (row: TRow) => string;
  private rows: Map<string, TRow[]>;

  constructor(columnsDefinition: TColumnsDefinition) {
    this.rows = new Map();
    const ids = columnsDefinition.filter(col => col.key).map(col => col.id);
    this.getKey = eval(`r => [r.${ids.join(', r.')}].join('-')`);
  }

  get(key: string) {
    return this.rows.get(key);
  }

  update(key: string, rowsArray: TRow[]) {
    this.rows.set(key, rowsArray);
  }

  asArray() {
    const res: TRow[] = [];
    for (const rowsArray of Array.from(this.rows.values())) {
      res.push.apply(res, rowsArray as TRow[]);
    }
    return res;
  }
}

export function rowsCollapser(rows: TRow[]) {
  const map = new Map();
  const secIds = new Set();
  for (const row of rows) {
    const { SECID, TYPE } = row;
    const id = `${SECID}-${TYPE}`;
    if (map.has(id)) {
      const prevRow = map.get(id);
      const pl = new Decimal(row.PL).plus(prevRow.PL);
      const dealPriceQty = new Decimal(row.DEALPRICEQTY).plus(prevRow.DEALPRICEQTY);
      const plpercent = new Decimal(100).mul(pl).div(dealPriceQty.isZero() ? 1 : dealPriceQty);

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

export function capitalize(word: string) {
  return `${word.slice(0, 1).toUpperCase()}${word.slice(1, word.length).toLowerCase()}`;
}
