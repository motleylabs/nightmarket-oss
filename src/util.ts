import { PublicKey } from "@solana/web3.js";

// shorten the checksummed version of the input address to have 4 characters at start and end
export function shortenAddress(address?: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function isPublicKey(address: string) {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
