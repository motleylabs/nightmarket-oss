import { PublicKey } from '@solana/web3.js';

const REWARD_CENTER_PROGRAM = new PublicKey('rwdLstiU8aJU1DPdoPtocaNKApMhCFdCg283hz8dd3u');

export async function findRewardCenter(auctionHouse: PublicKey): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from('reward_center'), auctionHouse.toBuffer()],
    REWARD_CENTER_PROGRAM
  );
}

export async function findListingAddress(
  seller: PublicKey,
  metadata: PublicKey,
  rewardCenter: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from('listing'), seller.toBuffer(), metadata.toBuffer(), rewardCenter.toBuffer()],
    REWARD_CENTER_PROGRAM
  );
}

export async function findAuctioneer(
  auctionHouse: PublicKey,
  rewardCenter: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from('auctioneer'), auctionHouse.toBuffer(), rewardCenter.toBuffer()],
    REWARD_CENTER_PROGRAM
  );
}

export async function findOfferAddress(
  seller: PublicKey,
  metadata: PublicKey,
  rewardCenter: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from('offer'), seller.toBuffer(), metadata.toBuffer(), rewardCenter.toBuffer()],
    REWARD_CENTER_PROGRAM
  );
}

export async function findPurchaseTicketAddress(
  listing: PublicKey,
  offer: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from('listing'), listing.toBuffer(), offer.toBuffer()],
    REWARD_CENTER_PROGRAM
  );
}
