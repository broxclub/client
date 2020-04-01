export function rtrim(x: string) {
  return x.replace(/\W+$/, '');
}

export function checkRequired(data: {[key: string]: any}) {
  Object.keys(data).map(key => {
    if (!data[key]) {
      throw new Error(`Required parameter ${key} undefined`);
    }
  });
}
