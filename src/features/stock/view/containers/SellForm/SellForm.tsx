import React, { ChangeEvent } from 'react';
import block from 'bem-cn';
import { Button, Modal, Error, Label } from 'shared/view/elements';
import { bind } from 'decko';
import * as NS from '../../../namespace';
import * as actions from '../../../redux/actions';
import * as selectors from '../../../redux/selectors';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { sellSecurityFormEntry } from 'features/stock/redux/reduxFormEntries';
import { InputBaseFieldWrapper } from 'shared/view/redux-form/FieldWrappers/FieldWrappers';
import { InputBaseField } from 'shared/view/redux-form';
import { required } from 'shared/helpers/validators';
import Decimal from 'decimal.js';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { ICommunication } from 'shared/types/redux';
import { IAppReduxState } from 'shared/types/app';

import './SellForm.scss';

interface IOwnProps {
  sellFormPayload: NS.ISellSecurityRequestPayload;
  onSellSuccess(): void;
  onClose(): void;
}

interface IStateProps {
  sellSecurityCommunication: ICommunication;
}

interface IActionProps {
  reset: typeof actions.reset;
  sellSecurity: typeof actions.sellSecurity;
}

interface IState {
  totalPrice: number;
  sellDone: boolean;
}

const b = block('sell-form');

const { name: formName, fieldNames } = sellSecurityFormEntry;

type TProps = IActionProps & IStateProps & IOwnProps & InjectedFormProps<NS.ISellSecurityForm, IOwnProps>;

class SellForm extends React.PureComponent<TProps, IState> {
  public static mapStateToProps(state: IAppReduxState): IStateProps {
    return {
      sellSecurityCommunication: selectors.selectCommunication(state, 'sellSecurity'),
    };
  }

  public static mapDispatch(dispatch: Dispatch): IActionProps {
    return bindActionCreators(
      {
        reset: actions.reset,
        sellSecurity: actions.sellSecurity,
      },
      dispatch,
    );
  }

  public state: IState = {
    totalPrice: 0,
    sellDone: false,
  };

  public componentDidUpdate({
    sellSecurityCommunication: prevSellSecurityCommunication
  }: TProps) {
    const { sellSecurityCommunication } = this.props;

    if (!prevSellSecurityCommunication.isLoaded && sellSecurityCommunication.isLoaded) {
      this.setState({ sellDone: true }, () => this.props.onSellSuccess());
    }
  }

  public render() {
    const { sellDone } = this.state;
    return (
      <Modal isOpen title="Продажа бумаги" onClose={this.handleClose}>
        <div className={b()}>
          {sellDone ? (this.renderSellDone()) : this.renderFormContent()}
        </div>
      </Modal>
    );
  }

  @bind
  private renderSellDone() {
    return (
      <div>
        <div className={b('success')}>
          Успешно
        </div>

        <div className={b('actions')}>
          <Button
            color="light-blue"
            size="large"
            onClick={this.handleClose}
          >
            Закрыть
          </Button>
        </div>
      </div>
    );
  }

  @bind
  private renderFormContent() {
    const { secname, secid, available, price } = this.props.sellFormPayload;
    const { valid, error, sellSecurityCommunication } = this.props;
    const { totalPrice } = this.state;

    return (
      <>
        <div className={b('caption')}>
          <div>
            <span className={b('secname')}>{secname}</span>
          </div>
          <div className={b('hint-text')}>{secid}</div>
        </div>

        <div className={b('row')}>
          <div>
            <div className={b('contrast').mix(b('price'))}>{price} ₽</div>
            <div className={b('hint-text')}>Стоимость бумаги</div>
          </div>
          <div>
            <div className={b('hint-text')}>Доступно {available} шт.</div>
          </div>
        </div>

        <form onSubmit={this.handleSellFormSubmit}>
          <Label htmlFor={fieldNames.amount}>Введите количество бумаги</Label>
          <InputBaseFieldWrapper
            component={InputBaseField}
            name={fieldNames.amount}
            type={'number'}
            validate={[required, this.validateAmount]}
            onChange={this.handleAmountChange}
            validateOnChange
          />

          {totalPrice > 0 && (
            <div className={b('total-price')}>
              Ожидаемая стоимость сделки: <span className={b('total-price-val')}>{totalPrice}</span> ₽
            </div>
          )}

          {error && (
            <div className={b('error')}>
              <Error>{error}</Error>
            </div>
          )}

          {sellSecurityCommunication.error && (
            <div className={b('error')}>
              <Error>{sellSecurityCommunication.error}</Error>
            </div>
          )}

          <div className={b('actions')}>
            <Button
              color="light-blue"
              size="large"
              disabled={!valid}
              isShowPreloader={sellSecurityCommunication.isRequesting}
            >
              Продать
            </Button>
          </div>
        </form>
      </>
    );
  }

  @bind
  private handleSellFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    const { handleSubmit, sellSecurity } = this.props;
    const { secid, price, boardid, portfolioId } = this.props.sellFormPayload;
    handleSubmit(async data => {
      sellSecurity({
        secid,
        price,
        portfolioid: portfolioId,
        board: boardid,
        quantity: data.amount,
      });
    })(e);
  }

  @bind
  private validateAmount(value: string, allValues?: NS.ISellSecurityForm, props?: TProps, name?: string) {
    const { available } = this.props.sellFormPayload;
    if (!value) {
      return undefined;
    }
    const val = +value;
    if (isNaN(val)) {
      return 'Неверное число';
    }

    if (val <= 0) {
      return 'Введите количетсво бумаг для продажи';
    }

    if (val > available) {
      return `Нельзя продать больше чем ${available} шт.`;
    }

    return undefined;
  }

  @bind
  private handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const { price } = this.props.sellFormPayload;
    const value = +e.target.value;
    if (!isNaN(value) && value > 0) {
      this.setState({ totalPrice: new Decimal(price || 0).mul(value).toNumber() });
    } else {
      this.setState({ totalPrice: 0 });
    }
  }

  @bind
  private handleClose() {
    this.props.onClose();
  }
}

const withRedux = connect<IStateProps, IActionProps>(SellForm.mapStateToProps, SellForm.mapDispatch)(SellForm);
const withForm = reduxForm<NS.ISellSecurityForm, IOwnProps>({
  form: formName,
})(withRedux);
export default withForm;
