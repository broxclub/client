import React from 'react';
import block from 'bem-cn';
import { IBuySecurityRow } from '../../../namespace';
import { ICommunication } from 'shared/types/redux';
import { Preloader, Error, Button } from 'shared/view/elements';

import './BuyDone.scss';

interface IOwnProps {
  boughtRows: IBuySecurityRow[];
  communication: ICommunication;
  onClose(): void;
}

const b = block('buy-done');

type TProps = IOwnProps;

class BuyDone extends React.PureComponent<TProps> {
  public render() {
    const { communication, boughtRows, onClose } = this.props;
    return (
      <div className={b()}>
        <Preloader isShow={communication.isRequesting}>
          {communication.error && (
            <div className={b('error')}>
              <Error>{communication.error}</Error>
            </div>
          )}
          {communication.isLoaded && (
            <div className={b('success')}>
              <div className={b('caption')}>Покупка совершена успешно</div>
              <div className={b('results')}>
                {boughtRows.map(row => (
                  <div key={row.SECID} className={b('row')}>
                    <div className={b('row-cell')}>{row.SECID}</div>
                    <div className={b('row-cell')}>{row.SECNAME}</div>
                    <div className={b('row-cell')}>{row.quantity}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className={b('actions')}>
            <Button
              color="light-blue"
              size="large"
              onClick={onClose}
            >
              Закрыть
            </Button>
          </div>
        </Preloader>
      </div>
    );
  }
}

export default BuyDone;
