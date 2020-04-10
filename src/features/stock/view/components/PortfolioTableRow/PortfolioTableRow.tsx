import React from 'react';
import block from 'bem-cn';
import { IColumn, TColumnsDefinition } from 'classes/Securities/helpers';
import * as NS from '../../../namespace';

import './PortfolioTableRow.scss';

interface IOwnProps {
  columns: NS.TPortfolioTableColumns;
  visibleColumns: TColumnsDefinition;
  row: NS.IStockTableColumnData;
}

const b = block('portfolio-table-row');

type TProps = IOwnProps;

class PortfolioTableRow extends React.PureComponent<TProps> {

  public render() {
    const { visibleColumns, columns, row } = this.props;
    return (
      <div className={b()}>
        {visibleColumns.map((col: IColumn, index: number) => {
          const column = (columns as any)[col.id];

          return (
            <div key={col.id} className={b('cell')} style={{
              flex: `0 0 ${column.width}px`,
            }}>
              {column.renderCell(row, false)}
            </div>
          );
        })}
      </div>
    );
  }
}

export default PortfolioTableRow;
