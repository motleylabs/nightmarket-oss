import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function toSol(amount: number): number {
  return Math.round((amount / LAMPORTS_PER_SOL) * 100) / 100;
}
