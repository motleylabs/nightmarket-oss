import { AuctionHouseProgram } from '@holaplex/mpl-auction-house';
import { PublicKey } from '@solana/web3.js';

import { BN } from 'bn.js';

const REWARD_CENTER_PROGRAM = new PublicKey('RwDDvPp7ta9qqUwxbBfShsNreBaSsKvFcHzMxfBC3Ki');

export class RewardCenterProgram {
  static PUBKEY = REWARD_CENTER_PROGRAM;

  static findRewardCenterAddress(auctionHouse: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [Buffer.from('reward_center', 'utf8'), auctionHouse.toBuffer()],
      REWARD_CENTER_PROGRAM
    );
  }

  static findListingAddress(
    seller: PublicKey,
    metadata: PublicKey,
    rewardCenter: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        Buffer.from('listing', 'utf8'),
        seller.toBuffer(),
        metadata.toBuffer(),
        rewardCenter.toBuffer(),
      ],
      REWARD_CENTER_PROGRAM
    );
  }

  static findOfferAddress(
    buyer: PublicKey,
    metadata: PublicKey,
    rewardCenter: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [Buffer.from('offer'), buyer.toBuffer(), metadata.toBuffer(), rewardCenter.toBuffer()],
      REWARD_CENTER_PROGRAM
    );
  }

  static findAuctioneerAddress(
    auctionHouse: PublicKey,
    rewardCenter: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [Buffer.from('auctioneer', 'utf8'), auctionHouse.toBuffer(), rewardCenter.toBuffer()],
      AuctionHouseProgram.PUBKEY
    );
  }

  static async findAuctioneerTradeStateAddress(
    wallet: PublicKey,
    auctionHouse: PublicKey,
    tokenAccount: PublicKey,
    treasuryMint: PublicKey,
    tokenMint: PublicKey,
    tokenSize: number
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        Buffer.from('auction_house', 'utf8'),
        wallet.toBuffer(),
        auctionHouse.toBuffer(),
        tokenAccount.toBuffer(),
        treasuryMint.toBuffer(),
        tokenMint.toBuffer(),
        new BN('18446744073709551615').toArrayLike(Buffer, 'le', 8),
        new BN(tokenSize).toArrayLike(Buffer, 'le', 8),
      ],
      AuctionHouseProgram.PUBKEY
    );
  }

  static async findPurchaseTicketAddress(
    listing: PublicKey,
    offer: PublicKey
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('purchase_ticket'), listing.toBuffer(), offer.toBuffer()],
      REWARD_CENTER_PROGRAM
    );
  }
}
