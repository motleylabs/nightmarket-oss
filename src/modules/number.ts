/**
 * Converts the given number to "compact" format like 10K, 1.9M, etc.
 * 
 * @param number number to make compact
 * @returns compacted string
 */
export function asCompactNumber(number: number): string {
  return new Intl.NumberFormat('en-GB', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(number);
}