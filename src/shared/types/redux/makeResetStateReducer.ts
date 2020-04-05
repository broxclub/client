import { IPlainAction } from 'shared/types/redux';

type IInitialStateFunc<S> = (state: S) => S;
type IInitalState<S> = S | IInitialStateFunc<S>;

export default function makeResetStateReducer<A extends IPlainAction<string>, S>(
  type: A['type'],
  initialState: IInitalState<S>,
) {
  return (state: S, action: A) =>
    action.type === type
      ? typeof initialState === 'function'
      ? (initialState as IInitialStateFunc<S>)(state)
      : initialState
      : state;
}
