import { PROGRAM_ID, RewardCenter, rewardCenterDiscriminator } from '@holaplex/hpl-reward-center';
import type { Metaplex } from '@metaplex-foundation/js';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import type { Connection } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

import type { AuctionHouse } from '../typings';

export const getAuctionHouseInfo = async (
  connection: Connection,
  metaplex: Metaplex,
  address: PublicKey
): Promise<AuctionHouse | null> => {
  let auctionHouse: AuctionHouse | null = null;

  try {
    const mpAuctionHouse = await metaplex.auctionHouse().findByAddress({
      address,
      auctioneerAuthority: new PublicKey(process.env.NEXT_PUBLIC_AUCTIONEER_AUTHORITY ?? ''),
    });

    auctionHouse = {
      address: mpAuctionHouse.address.toBase58(),
      authority: mpAuctionHouse.authorityAddress.toBase58(),
      auctionHouseFeeAccount: mpAuctionHouse.feeAccountAddress.toBase58(),
      auctionHouseTreasury: mpAuctionHouse.treasuryAccountAddress.toBase58(),
      sellerFeeBasisPoints: mpAuctionHouse.sellerFeeBasisPoints,
      treasuryMint: mpAuctionHouse.treasuryMint.address.toBase58(),
      rewardCenter: null,
    };

    const rewardCenterAccounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: bs58.encode(rewardCenterDiscriminator),
          },
        },
        {
          memcmp: {
            offset: 40,
            bytes: address.toString(),
          },
        },
      ],
    });

    let rewardCenter: RewardCenter | null = null;

    if (rewardCenterAccounts.length > 0) {
      rewardCenter = RewardCenter.deserialize(rewardCenterAccounts[0].account.data, 0)[0];
      auctionHouse.rewardCenter = {
        address: rewardCenterAccounts[0].pubkey,
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
