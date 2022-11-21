declare module '*/buyable.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const BuyableQuery: DocumentNode;

  export default defaultDocument;
}

declare module '*/collection.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const CollectionQuery: DocumentNode;
  export const CollectionQueryClient: DocumentNode;
  export const CollectionAttributeGroupsQuery: DocumentNode;
  export const CollectionNFTsQuery: DocumentNode;
  export const CollectionActivitiesQuery: DocumentNode;
  export const CollectionNftPreviewsQuery: DocumentNode;
  export const CollectionAnalyticsQuery: DocumentNode;

  export default defaultDocument;
}

declare module '*/auctionhouse.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const AuctionHouseInfo: DocumentNode;

  export default defaultDocument;
}

declare module '*/listing.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const ListingInfo: DocumentNode;

  export default defaultDocument;
}

declare module '*/listingpreview.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const ListingPreview: DocumentNode;

  export default defaultDocument;
}

declare module '*/nft.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const NftInfo: DocumentNode;
  export const NftListingInfo: DocumentNode;
  export const NftQuery: DocumentNode;
  export const NftActivitiesQuery: DocumentNode;
  export const NftMarketInfoQuery: DocumentNode;

  export default defaultDocument;
}

declare module '*/offer.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const OfferInfo: DocumentNode;

  export default defaultDocument;
}

declare module '*/profile.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const ProfileInfo: DocumentNode;
  export const WalletProfileQuery: DocumentNode;
  export const WalletProfileClientQuery: DocumentNode;
  export const FollowingProfileQuery: DocumentNode;
  export const CollectedNFTsQuery: DocumentNode;
  export const ProfileActivitiesQuery: DocumentNode;
  export const ProfileOffersQuery: DocumentNode;
  export const ProfileInfoByAddressQuery: DocumentNode;

  export default defaultDocument;
}

declare module '*/offerable.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const OfferableQuery: DocumentNode;

  export default defaultDocument;
}

declare module '*/offers.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const NftOffersQuery: DocumentNode;

  export default defaultDocument;
}

declare module '*/payouts.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const PayoutsQuery: DocumentNode;

  export default defaultDocument;
}

declare module '*/search.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const search: DocumentNode;

  export default defaultDocument;
}

declare module '*/trending.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const TrendingCollectionsQuery: DocumentNode;

  export default defaultDocument;
}

declare module '*/viewer.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const GetViewerQuery: DocumentNode;

  export default defaultDocument;
}
