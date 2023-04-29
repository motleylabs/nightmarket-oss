import marketplaces from '../marketplaces.json';

export interface Marketplace {
  marketplaceProgramAddress: string;
  auctionHouseAddress?: string | null;
  name: string;
  link: string;
  logo: string;
}

const multiTenantMarkets: Map<string, boolean> = new Map([
  ['hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk', true],
  ['RwDDvPp7ta9qqUwxbBfShsNreBaSsKvFcHzMxfBC3Ki', true],
  ['rwdD3F6CgoCAoVaxcitXAeWRjQdiGc5AVABKCpQSMfd', true],
]);

export const getMarketplace = (
  marketplaceAddress: string | undefined,
  auctionHouseAddress: string | undefined
): Marketplace | undefined => {
  return marketplaces.find(
    (m) =>
      m.marketplaceProgramAddress === marketplaceAddress &&
      (!multiTenantMarkets.get(m.marketplaceProgramAddress) ||
        m.auctionHouseAddress === (auctionHouseAddress ?? undefined))
  );
};
