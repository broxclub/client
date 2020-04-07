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

export function numSubClass(val: number) {
  if (val > 0) return 'positive';
  if (val < 0) return 'negative';
  return 'zero';
}
