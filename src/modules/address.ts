import { PublicKey } from '@solana/web3.js';

// shorten the checksummed version of the input address to have 4 characters at start and end
export function shortenAddress(address?: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function isPublicKey(address: string | undefined): boolean {
  if (!address) {
    return false;
  }

  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function addressAvatar(address: string | undefined): string {
  if (!address) {
    throw new Error('address string required');
  }

  try {
    const publicKey = new PublicKey(address);

    const gradient = publicKey.toBytes().reduce((a, b) => a + b, 0) % 8;

    return `/images/gradients/gradient-${gradient + 1}.png`;
  } catch {
    return '/images/gradients/gradient-1.png';
  }
}
