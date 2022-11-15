import { PayoutOperation } from '../../graphql.types';

export function buyerSellerRewards(
  saleLamports: number,
  mathematicalOperand: PayoutOperation,
  payoutNumeral: number,
  sellerRewardPayoutBasisPoints: number
): { buyerRewards: number; sellerRewards: number } {
  let totalRewards = 0;
  switch (mathematicalOperand) {
    case PayoutOperation.Multiple:
      totalRewards = saleLamports * payoutNumeral;
      break;
    case PayoutOperation.Divide:
      totalRewards = saleLamports / payoutNumeral;
      break;
  }

  let sellerRewards = (totalRewards * sellerRewardPayoutBasisPoints) / 1000;
  let buyerRewards = totalRewards - sellerRewards;
  return { buyerRewards, sellerRewards };
}
