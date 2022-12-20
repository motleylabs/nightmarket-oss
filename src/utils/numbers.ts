export const roundToPrecision = (number: number, decimalPlaces: 0|1|2|3|4|5) => {
  const p = Math.pow(10, decimalPlaces);
  return Math.round((number + Number.EPSILON) * p) / p
}