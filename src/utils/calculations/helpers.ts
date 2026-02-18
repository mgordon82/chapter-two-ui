export const round = (value: number, decimals = 2) =>
  Number(value.toFixed(decimals));

export const toNumberOrNaN = (v: string) =>
  v === '' || v === '-' ? NaN : Number(v);
