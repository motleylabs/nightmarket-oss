import { PayoutOperation } from '../../graphql.types';
import { asCompactNumber } from '../number';

export function buyerSellerRewards(
  saleLamports: number,
  mathematicalOperand: PayoutOperation,
  payoutNumeral: number,
  sellerRewardPayoutBasisPoints: number
): { buyerRewards: string; sellerRewards: string } {
  let totalRewards = 0;
  switch (mathematicalOperand) {
    case PayoutOperation.Multiple:
      totalRewards = (saleLamports * payoutNumeral) / 1000000000;
      break;
    case PayoutOperation.Divide:
      totalRewards = saleLamports / payoutNumeral / 1000000000;
      break;
  }

  let sellerRewards = (totalRewards * sellerRewardPayoutBasisPoints) / 1000;
  let buyerRewards = totalRewards - sellerRewards;

  return {
    buyerRewards: asCompactNumber(buyerRewards),
    sellerRewards: asCompactNumber(sellerRewards),
  };
}
