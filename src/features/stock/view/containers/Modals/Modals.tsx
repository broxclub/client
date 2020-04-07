import React, { Context } from 'react';
import { connect } from 'react-redux';
import { IAppReduxState } from 'shared/types/app';
import { BuyForm, SellForm } from 'features/stock/view/containers/index';
import * as NS from '../../../namespace';
import * as actions from '../../../redux/actions';
import * as selectors from '../../../redux/selectors';
import { bindActionCreators, Dispatch } from 'redux';
import { AppContext, IAppHookContext } from 'core/App';

interface IStateProps {
  buySecurityRequestForm: NS.IBuySecurityRequestPayload | null;
  sellSecurityRequestForm: NS.ISellSecurityRequestPayload | null;
}

interface IActionProps {
  resetBuySecurityRequest: typeof actions.resetBuySecurityRequest;
  resetSellSecurityRequest: typeof actions.resetSellSecurityRequest;
}

type TProps = IStateProps & IActionProps;

class Modals extends React.PureComponent<TProps> {
  public static contextType: Context<IAppHookContext> = AppContext;
  public static mapStateToProps(state: IAppReduxState): IStateProps {
    return {
      buySecurityRequestForm: selectors.selectBuyFormPayload(state),
      sellSecurityRequestForm: selectors.selectSellFormPayload(state),
    };
  }

  public static mapDispatch(dispatch: Dispatch): IActionProps {
    return bindActionCreators(
      {
        buySecurityRequest: actions.buySecurityRequest,
        resetBuySecurityRequest: actions.resetBuySecurityRequest,
        sellSecurityRequest: actions.sellSecurityRequest,
        resetSellSecurityRequest: actions.resetSellSecurityRequest,
      },
      dispatch,
    );
  }

  public render() {
    const {
      buySecurityRequestForm,
      resetBuySecurityRequest,
      sellSecurityRequestForm,
      resetSellSecurityRequest,
    } = this.props;
    const { onReloadRequested = () => void 0 } = this.context.hooks;

    if (buySecurityRequestForm) {
      const { portfolioId } = buySecurityRequestForm;
      return (
        <BuyForm
          onClose={resetBuySecurityRequest}
          onBuySuccess={onReloadRequested}
          portfolioId={portfolioId}
        />
      );
    }

    if (sellSecurityRequestForm) {
      return (
        <SellForm
          onClose={resetSellSecurityRequest}
          sellFormPayload={sellSecurityRequestForm}
          onSellSuccess={onReloadRequested}
        />
      );
    }

    return null;
  }
}

export default connect<IStateProps, IActionProps>(Modals.mapStateToProps, Modals.mapDispatch)(Modals);
