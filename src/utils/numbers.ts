export const roundToPrecision = (number: number, decimalPlaces: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
  const p = Math.pow(10, decimalPlaces);
  return Math.round((number + Number.EPSILON) * p) / p;
};

export const formatToLocaleNumber = (number: number, decimalPlaces: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
  return Number(Number(number).toFixed(0)).toLocaleString('en-US', {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  });
};
