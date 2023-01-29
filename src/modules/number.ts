const COMPACT_NUMBER_FORMATTER: Intl.NumberFormat = new Intl.NumberFormat('en-GB', {
  notation: 'compact',
  compactDisplay: 'short',
});

/**
 * Converts the given number to "compact" format like 10K, 1.9M, etc.
 *
 * @param number number to make compact
 * @returns compacted string
 */
export function asCompactNumber(number: number): string {
  return COMPACT_NUMBER_FORMATTER.format(number);
}

const USD_FORMATTER: Intl.NumberFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const BASIC_NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export function asBasicNumber(number: number) {
  return !isNaN(number) ? BASIC_NUMBER_FORMATTER.format(number) : null;
}

/**
 * Formats the USD amount in US-currency format (e.g. $123,456.78)
 *
 * @param usd dollar amount to be formatted
 * @returns formatted dollar amount
 */
export function asUsdString(usd: number): string {
  return USD_FORMATTER.format(usd);
}

export function percentageDifference(startNum: number, endNum: number): number {
  const change = endNum - startNum;
  return (change / startNum) * 100;
}
