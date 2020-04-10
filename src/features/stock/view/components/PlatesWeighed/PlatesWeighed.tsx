import React from 'react';
import block from 'bem-cn';
import { ISecurityPlate } from 'features/stock/namespace';
import { StockPlate } from 'features/stock/view/components/index';

import './PlatesWeighed.scss';

interface IOwnProps {
  plates: ISecurityPlate[];
  onSellClicked(security: ISecurityPlate): void;
}

const b = block('plates-weighed');

type TProps = IOwnProps;

class PlatesWeighed extends React.PureComponent<TProps> {
  public render() {
    const { onSellClicked } = this.props;
    return (
      <div className={b()}>
        {this.sortedPlates.map((plate, index) => (
          <StockPlate key={`plate${index}`} security={plate} onSellClicked={onSellClicked} />
        ))}
      </div>
    );
  }

  private get sortedPlates() {
    const { plates } = this.props;

    return plates.sort((a: ISecurityPlate, b: ISecurityPlate) => {
      return (+b.plPercent as any) - (+a.plPercent as any);
    });
  }
}

export default PlatesWeighed;
