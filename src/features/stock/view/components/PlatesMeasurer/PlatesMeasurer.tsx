import React from 'react';
import block from 'bem-cn';
import { ISecurityPlate } from 'features/stock/namespace';
import {
  CellMeasurer,
  CellMeasurerCache,
  createMasonryCellPositioner,
  Masonry
} from "react-virtualized";
import { bind } from 'decko';
import { MasonryCellProps } from 'react-virtualized/dist/es/Masonry';
import { StockPlate } from 'features/stock/view/components/index';

interface IOwnProps {
  plates: ISecurityPlate[];
}

const b = block('plates-measurer');

type TProps = IOwnProps;

class PlatesMeasurer extends React.PureComponent<TProps> {
  private cache = new CellMeasurerCache({
    // defaultHeight: 300,
    defaultWidth: 290,
    fixedWidth: false,
  });

  private cellPositioner = createMasonryCellPositioner({
    cellMeasurerCache: this.cache,
    columnCount: 4,
    columnWidth: 300,
    spacer: 10,
  });

  public render() {
    const { plates } = this.props;
    return (
      <div className={b()}>
        <Masonry
          cellCount={plates.length}
          cellMeasurerCache={this.cache}
          cellPositioner={this.cellPositioner}
          cellRenderer={this.cellRenderer}
          height={900}
          width={1240}
          autoHeight={true}
        />
      </div>
    );
  }

  @bind()
  private cellRenderer(props: MasonryCellProps) {
    const { plates } = this.props;
    const { index, key, parent, style } = props;
    const voidF = () => void 0;

    return (
      <CellMeasurer cache={this.cache} index={index} key={key} parent={parent}>
        <div style={style}>
          <StockPlate onSellClicked={voidF} security={plates[index]}/>
        </div>
      </CellMeasurer>
    );
  }
}

export default PlatesMeasurer;
