import { IPlainAction, IAction, IPlainFailAction, IFailAction } from 'shared/types/redux';

type IGenericPlainAction = IPlainAction<string>;
type IGenericAction = IAction<string, any>;
type IGenericPlainFailAction = IPlainFailAction<string>;
type IGenericFailAction = IFailAction<string, any>;

type NullaryAC<A extends IGenericPlainAction> = () => A;
type UnaryAC<A extends IGenericAction> = (payload: A['payload']) => A;

type NullaryFailedAC<A extends IGenericPlainFailAction> = (error: A['error']) => A;
type UnaryFailedAC<A extends IGenericFailAction> = (error: A['error'], payload: A['payload']) => A;

interface ICommunicationActionCreators<E, C, F> {
  execute: E;
  completed: C;
  failed: F;
}

interface IExtCommunicationActionCreators<E, C, F, S> {
  execute: E;
  started: S;
  completed: C;
  failed: F;
}

function makeCommunicationActionCreators<
  E extends IGenericAction,
  C extends IGenericAction,
  F extends IGenericFailAction,
  S extends IGenericAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
  startType: S['type'],
): IExtCommunicationActionCreators<UnaryAC<E>, UnaryAC<C>, UnaryFailedAC<F>, UnaryAC<S>>;

function makeCommunicationActionCreators<
  E extends IGenericAction,
  C extends IGenericAction,
  F extends IGenericPlainFailAction,
  S extends IGenericAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
  startType: S['type'],
): IExtCommunicationActionCreators<UnaryAC<E>, UnaryAC<C>, NullaryFailedAC<F>, UnaryAC<S>>;

function makeCommunicationActionCreators<
  E extends IGenericAction,
  C extends IGenericPlainAction,
  F extends IGenericFailAction,
  S extends IGenericAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
  startType: S['type'],
): IExtCommunicationActionCreators<UnaryAC<E>, NullaryAC<C>, UnaryFailedAC<F>, UnaryAC<S>>;

function makeCommunicationActionCreators<
  E extends IGenericAction,
  C extends IGenericPlainAction,
  F extends IGenericPlainFailAction,
  S extends IGenericAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
  startType: S['type'],
): IExtCommunicationActionCreators<UnaryAC<E>, NullaryAC<C>, NullaryFailedAC<F>, UnaryAC<S>>;

function makeCommunicationActionCreators<
  E extends IGenericPlainAction,
  C extends IGenericAction,
  F extends IGenericFailAction,
  S extends IGenericPlainAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
  startType: S['type'],
): IExtCommunicationActionCreators<NullaryAC<E>, UnaryAC<C>, UnaryFailedAC<F>, NullaryAC<S>>;

function makeCommunicationActionCreators<
  E extends IGenericPlainAction,
  C extends IGenericAction,
  F extends IGenericPlainFailAction,
  S extends IGenericPlainAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
  startType: S['type'],
): IExtCommunicationActionCreators<NullaryAC<E>, UnaryAC<C>, NullaryFailedAC<F>, NullaryAC<S>>;

function makeCommunicationActionCreators<
  E extends IGenericPlainAction,
  C extends IGenericPlainAction,
  F extends IGenericFailAction,
  S extends IGenericPlainAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
  startType: S['type'],
): IExtCommunicationActionCreators<NullaryAC<E>, NullaryAC<C>, UnaryFailedAC<F>, NullaryAC<S>>;

function makeCommunicationActionCreators<
  E extends IGenericPlainAction,
  C extends IGenericPlainAction,
  F extends IGenericPlainFailAction,
  S extends IGenericPlainAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
  startType: S['type'],
): IExtCommunicationActionCreators<NullaryAC<E>, NullaryAC<C>, NullaryFailedAC<F>, NullaryAC<S>>;

function makeCommunicationActionCreators<
  E extends IGenericPlainAction,
  C extends IGenericPlainAction,
  F extends IGenericPlainFailAction,
  S extends IGenericPlainAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
  startType: S['type'],
): IExtCommunicationActionCreators<NullaryAC<E>, NullaryAC<C>, NullaryFailedAC<F>, NullaryAC<S>>;

// ###

function makeCommunicationActionCreators<
  E extends IGenericAction,
  C extends IGenericAction,
  F extends IGenericFailAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
): ICommunicationActionCreators<UnaryAC<E>, UnaryAC<C>, UnaryFailedAC<F>>;

function makeCommunicationActionCreators<
  E extends IGenericAction,
  C extends IGenericAction,
  F extends IGenericPlainFailAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
): ICommunicationActionCreators<UnaryAC<E>, UnaryAC<C>, NullaryFailedAC<F>>;

function makeCommunicationActionCreators<
  E extends IGenericAction,
  C extends IGenericPlainAction,
  F extends IGenericFailAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
): ICommunicationActionCreators<UnaryAC<E>, NullaryAC<C>, UnaryFailedAC<F>>;

function makeCommunicationActionCreators<
  E extends IGenericAction,
  C extends IGenericPlainAction,
  F extends IGenericPlainFailAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
): ICommunicationActionCreators<UnaryAC<E>, NullaryAC<C>, NullaryFailedAC<F>>;

function makeCommunicationActionCreators<
  E extends IGenericPlainAction,
  C extends IGenericAction,
  F extends IGenericFailAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
): ICommunicationActionCreators<NullaryAC<E>, UnaryAC<C>, UnaryFailedAC<F>>;

function makeCommunicationActionCreators<
  E extends IGenericPlainAction,
  C extends IGenericAction,
  F extends IGenericPlainFailAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
): ICommunicationActionCreators<NullaryAC<E>, UnaryAC<C>, NullaryFailedAC<F>>;

function makeCommunicationActionCreators<
  E extends IGenericPlainAction,
  C extends IGenericPlainAction,
  F extends IGenericFailAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
): ICommunicationActionCreators<NullaryAC<E>, NullaryAC<C>, UnaryFailedAC<F>>;

function makeCommunicationActionCreators<
  E extends IGenericPlainAction,
  C extends IGenericPlainAction,
  F extends IGenericPlainFailAction
>(
  executeType: E['type'],
  completeType: C['type'],
  failType: F['type'],
): ICommunicationActionCreators<NullaryAC<E>, NullaryAC<C>, NullaryFailedAC<F>>;

// ########

function makeCommunicationActionCreators(
  executeType: string,
  completeType: string,
  failType: string,
  startType: string = '',
) {
  const res: any = {
    execute: (payload: any) => {
      return { payload, type: executeType };
    },
    completed: (payload: any) => {
      return { payload, type: completeType };
    },
    failed: (error: any, payload: any) => {
      return { error, payload, type: failType };
    },
  };
  if (startType !== '') {
    res.started = (payload: any) => {
      return { payload, type: startType };
    };
  }
  return res;
}

export default makeCommunicationActionCreators;
