import { PublicKey } from '@solana/web3.js';

const REWARD_CENTER_PROGRAM = new PublicKey('rwdLstiU8aJU1DPdoPtocaNKApMhCFdCg283hz8dd3u');

export class RewardCenterProgram {
  static async findRewardCenter(auctionHouse: PublicKey): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('reward_center'), auctionHouse.toBuffer()],
      REWARD_CENTER_PROGRAM
    );
  }

  static async findListingAddress(
    seller: PublicKey,
    metadata: PublicKey,
    rewardCenter: PublicKey
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('listing'), seller.toBuffer(), metadata.toBuffer(), rewardCenter.toBuffer()],
      REWARD_CENTER_PROGRAM
    );
  }

  static async findAuctioneer(
    auctionHouse: PublicKey,
    rewardCenter: PublicKey
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('auctioneer'), auctionHouse.toBuffer(), rewardCenter.toBuffer()],
      REWARD_CENTER_PROGRAM
    );
  }
}
