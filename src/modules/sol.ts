import { LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * Converts lamports to sol
 */
export function toSol(lamports: number, precision: number = 2): number {
  var multiplier = Math.pow(10, precision);
  return Math.round((lamports / LAMPORTS_PER_SOL) * multiplier) / multiplier;
}
