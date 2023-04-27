import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import BN from 'bn.js';

import { toSol } from '../modules/sol';

export function formatAsBN(value: string | number | null | undefined): string {
  if (!value) {
    return '0';
  }

  const bnValue = new BN(value);
  const formattedValue = bnValue.div(new BN('10000000')).toNumber().toFixed(2);

  return formattedValue;
}

export function formatAsSOL(price: BN): number {
  if (!price) {
    return 0;
  }

  return toSol(price.toNumber());
}

export function getSolFromLamports(price: number | string, decimals = 0, round = 0): number {
  let value = Number(price) / LAMPORTS_PER_SOL;
  if (value === 0) {
    return 0;
  }

  if (decimals > 0) {
    value = value / 10 ** decimals;
  }

  if (round > 0) {
    let multiplied = Math.round(value * 10 ** round);
    while (multiplied === 0) {
      round += 1;
      multiplied = Math.round(value * 10 ** round);
    }
    value = multiplied / 10 ** round;
  }
  return value;
}

export function getExtendedSolFromLamports(price: string, decimals = 3, round = 2): string {
  const numPrice = Number(price);
  if (numPrice < 1000) {
    return `${getSolFromLamports(price, 0, round)}`;
  } else {
    return `${getSolFromLamports(price, decimals, round)} K`;
  }
}
