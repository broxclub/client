import Decimal from 'decimal.js';
import { TColumnsDefinition, TRow, RowsBuffer, capitalize, rowsCollapser } from 'classes/Securities/helpers';
import moment from 'moment';
import { TMarketsSubscription } from 'services/Api/StockClientWS';

class SecuritiesBuffer {
  private rowsBuffer: RowsBuffer;
  private _subscription: TMarketsSubscription = {};
  private portfolioId: number;
  private balance: number;
  private startBalance: number;

  constructor(
    columns: TColumnsDefinition,
    securities: TRow[],
    portfolioId: number,
    balance: number,
    startBalance: number,
  ) {
    this.rowsBuffer = new RowsBuffer(columns);
    this.portfolioId = portfolioId;
    this.balance = balance;
    this.startBalance = startBalance;
    this.initBuffer(securities);
  }

  public get subscriptions(): TMarketsSubscription {
    return this._subscription;
  }

  public processSubscription(buf: TRow[]) {
    for (const row of buf) {
      const id = this.rowsBuffer.getKey(row);
      const { YIELD } = row;
      const rowsArray = this.rowsBuffer.get(id);
      const LCURRENTPRICE = row.LCURRENTPRICE || row.WAPRICE || 0;

      if (!rowsArray) {
        continue;
      }

      const updateRows = rowsArray.map(bufRow => {
        bufRow.LCURRENTPRICE = new Decimal(LCURRENTPRICE).toFixed(2);

        // bufRow.DEALPRICE - цена покупки
        if (bufRow.TYPE === 'buy') {
          const lcurrentprice = new Decimal(LCURRENTPRICE);
          const pl = lcurrentprice.mul(bufRow.QUANTITY).minus(new Decimal(bufRow.DEALPRICE).mul(bufRow.QUANTITY));
          // const plpercent = pl.mul(100).div(bufRow.BPRICE);
          const dealPriceQty = new Decimal(bufRow.DEALPRICE).mul(bufRow.QUANTITY);
          const plpercentShow = new Decimal(100).mul(pl).div(dealPriceQty);

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

      this.rowsBuffer.update(id, updateRows);
    }
  }

  public get totals() {
    let totals: { [key: string]: Decimal } = {
      PL: new Decimal(0),
      BPRICE: new Decimal(0),
      PLPERCENT: new Decimal(0),
    };

    this.rowsBuffer.asArray().map(row => {
      totals.PL = totals.PL.add(row.PL);
      totals.BPRICE = totals.BPRICE.add(row.BPRICE);
      totals.PLPERCENT = totals.PLPERCENT.add(row.PLPERCENT);
    });

    return {
      PL: totals.PL.toFixed(2),
      BPRICE: totals.BPRICE.toFixed(2),
      PLPERCENT: totals.PLPERCENT.toFixed(2),
      PLPERCENT_SHOW: totals.BPRICE.add(this.balance)
        .mul(100)
        .div(this.startBalance)
        .minus(100)
        .toFixed(2),
    };
  }

  public get sortedRowsArray() {
    return this.sortFunc(this.rowsBuffer.asArray());
  }

  public get collapsedRows() {
    return rowsCollapser(this.sortedRowsArray);
  }

  public get plates() {
    return this.collapsedRows.map(row => ({
      secid: row.SECID,
      secname: row.SECNAME,
      date: row.DATE,
      quantity: row.QUANTITY,
      boardid: row.BOARDID,
      currentprice: row.LCURRENTPRICE,
      dealprice: row.DEALPRICE,
      pl: row.PL,
      plPercent: row.PLPERCENT,
      totalprice: row.BPRICE,
    }));
  }

  private sortFunc(rows: TRow[]) {
    return rows.sort((a: TRow, b: TRow) => {
      return a.SECID > b.SECID ? 1 : a.SECID < b.SECID ? -1 : 0;
    });
  }

  private initBuffer(securities: TRow[]) {
    for (const sec of securities) {
      const {
        board: boardid,
        secid,
        secname,
        create_at,
        type,
        low,
        high,
        marketprice,
        quantity,
        voltoday,
        lcurrentprice,
        buyprice,
        pnl, //, last, value, closeprice, issuecapitalization, yieldtoprevyield, yieldtooffer, yieldlastcoupon
      } = sec;

      if (!this._subscription[boardid as string]) {
        this._subscription[boardid as string] = [];
      }

      const lCurPriceDecimal = new Decimal(lcurrentprice || 0);
      const isBuy = (type as string).toLowerCase() === 'buy';
      const bpriceDecimal = lCurPriceDecimal.mul(quantity || 0);
      const pnlDecimal = new Decimal(pnl);
      const plpercent = pnlDecimal.mul(100).div(bpriceDecimal);
      const [day, month, year] = moment(create_at as string)
        .format('D-MMMM-YY')
        .split('-');

      const row: TRow = {
        id: sec.id,
        portfolioId: this.portfolioId,
        SECID: secid,
        SECNAME: secname,
        DATE: `${day}-${capitalize(month)}-${year}`,
        BOARDID: boardid,
        LOW: low,
        HIGH: high,
        MARKETPRICE: marketprice,
        VOLTODAY: voltoday,
        DEALPRICE_SHOW: `${+lcurrentprice > 0 ? '' : '-'}${new Decimal(lcurrentprice).toFixed(2)}`,
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
        DEALPRICEQTY: 0,
        LCURRENTPRICE: '',
      };

      const id = this.rowsBuffer.getKey(row);
      const rowsArray = this.rowsBuffer.get(id) || [];
      rowsArray.push(row);
      this.rowsBuffer.update(id, rowsArray);
      this._subscription[boardid as string].push(secid as string);
    }
  }
}

export default SecuritiesBuffer;
