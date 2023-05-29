import { AuctionHouse as MtlyAuctionHouse } from '@motleylabs/mtly-auction-house';
import { RewardCenter } from '@motleylabs/mtly-reward-center';
import type { Connection } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

import type { AuctionHouse } from '../typings';
import { RewardCenterProgram } from '../modules/reward-center';

export const getAuctionHouseByAddress = async (
  connection: Connection,
  auctionHouse: PublicKey
): Promise<MtlyAuctionHouse> => {
  const mtlyHouse = await MtlyAuctionHouse.fromAccountAddress(connection, auctionHouse);
  return mtlyHouse;
};

export const getAuctionHouseInfo = async (
  connection: Connection,
  address: PublicKey
): Promise<AuctionHouse | null> => {
  let auctionHouse: AuctionHouse | null = null;

  try {
    const mpAuctionHouse = await getAuctionHouseByAddress(connection, address);

    auctionHouse = {
      address: address.toBase58(),
      authority: mpAuctionHouse.authority.toBase58(),
      auctionHouseFeeAccount: mpAuctionHouse.auctionHouseFeeAccount.toBase58(),
      auctionHouseTreasury: mpAuctionHouse.auctionHouseTreasury.toBase58(),
      sellerFeeBasisPoints: mpAuctionHouse.sellerFeeBasisPoints,
      treasuryMint: mpAuctionHouse.treasuryMint.toBase58(),
      rewardCenter: null,
    };

    const [rewardCenterAddress] = await RewardCenterProgram.findRewardCenterAddress(address);
    const rewardCenterAccount = await connection.getAccountInfo(rewardCenterAddress);

    let rewardCenter: RewardCenter | null = null; 

    if (!!rewardCenterAccount) {
      rewardCenter = RewardCenter.deserialize(rewardCenterAccount.data, 0)[0];
      auctionHouse.rewardCenter = {
        address: rewardCenterAddress,
        tokenMint: rewardCenter.tokenMint,
        sellerRewardPayoutBasisPoints: rewardCenter.rewardRules.sellerRewardPayoutBasisPoints,
        payoutNumeral: rewardCenter.rewardRules.payoutNumeral,
        mathematicalOperand: rewardCenter.rewardRules.mathematicalOperand,
      };
    } else {
      auctionHouse.rewardCenter = null;
    }

    return auctionHouse;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return null;
  }
};
