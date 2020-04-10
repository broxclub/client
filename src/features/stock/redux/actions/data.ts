import * as NS from '../../namespace';

export function reset(): NS.IReset {
  return { type: 'STOCK:RESET' };
}

export function buySecurityRequest(payload: NS.IBuySecurityRequestPayload): NS.IBuySecurityCallRequest {
  return { payload, type: 'STOCK:BUY_SECURITY_REQUEST' };
}

export function resetBuySecurityRequest(): NS.IResetBuySecurityCallRequest {
  return { type: 'STOCK:RESET_BUY_SECURITY_REQUEST' };
}

export function sellSecurityRequest(payload: NS.ISellSecurityRequestPayload): NS.ISellSecurityCallRequest {
  return { payload, type: 'STOCK:SELL_SECURITY_REQUEST' };
}

export function resetSellSecurityRequest(): NS.IResetSellSecurityCallRequest {
  return { type: 'STOCK:RESET_SELL_SECURITY_REQUEST' };
}

export function subscribeMarkets( payload: NS.ISubscribeMarketsPayload ): NS.ISubscribeToMarkets {
  return { payload, type: 'STOCK:SUBSCRIBE_TO_MARKETS' };
}

export function updateMarkets( payload: NS.IUpdateSecuritiesResponse ): NS.IUpdateSecurities {
  return { payload, type: 'STOCK:UPDATE_SUBSCRIBED_SECURITIES' };
}
