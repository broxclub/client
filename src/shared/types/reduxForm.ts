export interface IReduxFormEntry<T, E> {
  name: T;
  fieldNames: { [K in keyof E]: string };
}
