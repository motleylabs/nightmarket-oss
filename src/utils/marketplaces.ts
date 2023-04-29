import marketplaces from '../marketplaces.json';

export interface Marketplace {
  marketplaceProgramAddress: string;
  auctionHouseAddress?: string | null;
  name: string;
  link: string;
  logo: string;
  buyNowEnabled: boolean;
}

export const getMarketplace = (marketplaceAddress: string | undefined): Marketplace | undefined => {
  return marketplaces.find((m) => m.marketplaceProgramAddress === marketplaceAddress);
};
