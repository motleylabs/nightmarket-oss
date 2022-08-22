import { LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * Converts lamports to sol
 */
export function toSol(lamports: number, precision: number = 2): number {
  var multiplier = Math.pow(10, precision);
  return Math.round((lamports / LAMPORTS_PER_SOL) * multiplier) / multiplier;
}


export function toUsd(sol: number): number {
  console.warn("Using a placeholder conversion from SOL to USD.");
  return sol*36.5;
}


export function toUsdString(sol: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(toUsd(sol));
}