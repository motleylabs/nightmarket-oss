import type { PayoutOperation } from '@motleylabs/mtly-reward-center';
import type { PublicKey } from '@solana/web3.js';

import type { SearchMode } from '../hooks/globalsearch';

export type ErrorWithLogs = Error & { logs: string };

type Pagination = {
  hasNextPage: boolean;
};

type SearchType = { searchType: `${SearchMode}` };

export type RPCReport = {
  volume: number;
  tps: number;
  solPrice: number;
};

export type OverallStat = {
  marketCap: number;
  volume: number;
  volume1d: number;
};

export type StatSearch = {
  address: string | null;
  imgURL: string | null;
  isVerified: boolean | null;
  name: string | null;
  slug: string | null;
  twitter: string | null;
  volume1d: string | null;
} & SearchType;

export type StatSearchData = {
  results: StatSearch[];
} & Pagination;

export type NftActivitiesData = {
  activities: NftActivity[];
} & Pagination;

export type NftActivity = {
  activityType: string;
  buyer: string | null;
  blockTimestamp: number;
  martketplaceProgramAddress: string;
  auctionHouseAddress: string;
  price: string;
  seller: string | null;
  signature: string;
};

export type ActivityEvent = {
  mint: string;
  activity: NftActivity;
};

export type NftTrait = {
  rarity: number;
  traitType: string;
  value: string;
};

export type ActionInfo = {
  userAddress: string;
  price: string;
  signature: string;
  blockTimestamp: number;
  auctionHouseProgram: string;
  auctionHouseAddress: string;
  tradeState?: string;
};

export type ActionEvent = {
  mint: string;
  action: ActionInfo;
};

export type Nft = {
  description: string;
  image: string;
  listingType: string;
  mintAddress: string;
  moonrankRank: number;
  name: string;
  owner: string | null;
  projectId: string;
  projectName: string | null;
  sellerFeeBasisPoints: number;
  symbol: string;
  tokenStandard: string;
  traits: NftTrait[];
  uri: string;
  highestBid: ActionInfo | null;
  latestListing: ActionInfo | null;
  lastSale: ActionInfo | null;
  metadata: string;
  // listed or not
  isListed: boolean;
};

export type RewardCenter = {
  address: PublicKey;
  tokenMint: PublicKey;
  sellerRewardPayoutBasisPoints: number;
  payoutNumeral: number;
  mathematicalOperand: PayoutOperation;
};

export type AuctionHouse = {
  address: string;
  authority: string;
  auctionHouseFeeAccount: string;
  auctionHouseTreasury: string;
  sellerFeeBasisPoints: number;
  treasuryMint: string;
  rewardCenter: RewardCenter | null;
};

export type NftDetail = {
  nft: Nft;
  auctionHouse: AuctionHouse;
};

export type Collection = {
  attributes: CollectionAttribute[];
  description: string;
  id: string;
  slug: string;
  image: string;
  name: string;
  statistics: CollectionStatistics;
  isVerified: boolean;
  symbol: string;
  twitter: string | null;
  discord: string | null;
  website: string | null;
  verifiedCollectionAddress: string;
};

export type UserCollection = {
  estimatedValue: string;
  floorPrice: string;
  id: string;
  slug: string;
  image: string;
  name: string;
  nftsOwned: number;
};

export type MiniCollection = {
  slug: string;
  name: string;
  floorPrice: string;
};

export type AttributeStat = {
  value: string;
  counts: number;
  floorPrice: string;
  listed: number;
  percent: number;
};

export type CollectionAttribute = {
  name: string;
  type: string;
  values: AttributeStat[];
};

export type CollectionStatistics = {
  floor1d: string;
  holders: number;
  listed1d: string;
  marketCap: string;
  marketCapSol: string;
  supply: number;
  volume1d: string;
};

export type CollectionsTrendsData = {
  trends: CollectionTrend[];
} & Pagination;

export type CollectionTrend = {
  floor1d: string;
  changeFloor1d: number;
  listed1d: string;
  changeListed1d: number;
  volume1d: string;
  changeVolume1d: number;
  volume7d: string;
  changeVolume7d: number;
  volume1h: string;
  changeVolume1h: number;
  collection: Collection;
};

export type SelectedTrend = {
  listedCount: string | undefined;
  listedCountChange: number | undefined;
  volume: string | undefined;
  volumeChange: number | undefined;
  floorPrice: string | undefined;
  floorPriceChange: number | undefined;
};

export type CollectionSeriesData = {
  series: CollectionSeries[];
} & Pagination;

export type CollectionSeries = {
  floorPrice: string;
  holders: number;
  listed: number;
  timestamp: string;
  volume: number;
};

export type CollectionNftsData = {
  nfts: Nft[];
} & Pagination;

export type CollectionActivity = {
  activityType: string;
  buyer: string;
  blockTimestamp: number;
  image: string;
  martketplaceProgramAddress: string;
  auctionHouseAddress: string;
  mint: string;
  name: string;
  price: string;
  seller: string;
  signature: string;
  symbol: string;
};

export type UserActivity = {
  symbol: string;
  mint: string;
  name: string;
  image: string;
  seller: string;
  buyer: string;
  price: string;
  activityType: string;
  martketplaceProgramAddress: string;
  auctionHouseAddress: string;
  blockTimestamp: number;
  signature: string;
};

export type Offer = {
  symbol?: string;
  mint?: string;
  name?: string;
  image?: string;
  activityType: string;
  buyer: string;
  blockTimestamp: number;
  martketplaceProgramAddress: string;
  auctionHouseAddress: string;
  price: string;
  seller: string | null;
  signature: string;
};

export type OfferEvent = {
  mint: string;
  offer: Offer;
};

export type CollectionActivitiesData = {
  activities: CollectionActivity[];
} & Pagination;

export type UserOffersData = {
  activities: Offer[];
} & Pagination;

export type UserActivitiesData = {
  activities: UserActivity[];
} & Pagination;

export type UserNfts = {
  collections: UserCollection[];
  nfts: Nft[];
};

export type DataPoint = {
  amount: number;
  timestamp: string;
  value: number | string;
};

export type GlobalSearchData = Partial<{
  nft: Nft & SearchType;
  profiles: StatSearch[];
  collections: StatSearch[];
}>;

export enum CollectionInterval {
  OneHour = '1h',
  OneDay = '1d',
  SevenDay = '7d',
  // ThirtyDay = '1m',
}

export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export enum CollectionSort {
  Volume = 'volume',
}

export enum CollectionDateRange {
  HOUR = 'per_hour',
  DAY = 'per_day',
}
