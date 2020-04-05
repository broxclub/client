import { IReduxFormEntry } from 'shared/types/reduxForm';

export function makeReduxFormEntry<E, T = string>(
  formName: T,
  fieldNames: Array<keyof E>,
): IReduxFormEntry<T, {[K in keyof E]: K }> {
  return {
    name: formName,
    fieldNames: fieldNames.reduce((res, name) => ({ ...res, [name]: name }), {}) as any,
  };
}
