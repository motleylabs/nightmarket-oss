import BN from 'bn.js';

export type Volume = number;
type Uuid = string;

interface MarketplaceStats {
  nfts: Volume;
}

interface CreatorCounts {
  creations: number;
}

export interface FileUploadPayload {
  name: string | undefined;
  type: string | undefined;
  url: string;
}

export interface Marketplace {
  configAddress: string;
  subdomain: string;
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  auctionHouses: AuctionHouse[];
  ownerAddress: string;
  creators: MarketplaceCreator[];
  stats?: MarketplaceStats;
}

interface GraphQLObject {
  __typename: string;
}

export interface MarketplaceCreator {
  creatorAddress: string;
  storeConfigAddress: string;
  preview: Nft[];
  twitterHandle?: string;
  profile?: TwitterProfile | null;
  nftCount?: number;
}

export interface AuctionHouse {
  address: string;
  treasuryMint: string;
  auctionHouseTreasury: string;
  treasuryWithdrawalDestination: string;
  feeWithdrawalDestination: string;
  authority: string;
  creator: string;
  auctionHouseFeeAccount: string;
  bump: number;
  treasuryBump: number;
  feePayerBump: number;
  sellerFeeBasisPoints: number;
  fee: number;
  requiresSignOff: boolean;
  canChangeSalePrice: boolean;
  stats?: MintStats;
}

export interface AttributeVariant {
  name: string;
  count: number;
}

export interface AttributeGroup {
  name: string;
  variants: AttributeVariant[];
}

export interface MintStats {
  volume24hr?: BN;
  volumeTotal?: BN;
  average?: BN;
  floor?: BN;
  mint: string;
  auctionHouse?: AuctionHouse;
}
export interface Creator extends UserWallet {
  attributeGroups: AttributeGroup[];
  stats: MintStats[];
  counts: CreatorCounts;
}

export interface NftAttribute {
  value: string;
  traitType: string;
}

export interface UserWallet {
  address: string;
  profile?: TwitterProfile | null;
  displayName: string;
  previewImage: string;
  previewBanner: string;
  shortAddress: string;
}

export interface NftOwner extends UserWallet {
  associatedTokenAccountAddress: string;
  twitterHandle: string;
}

export interface NftCreator extends UserWallet {
  twitterHandle?: string;
  metadataAddress: string;
  share: number;
  verified: boolean;
  position: number;
}

export interface MetadataJson {
  address: string;
  name: string;
  mintAddress: string;
  image?: string;
  creatorAddress?: string;
  creatorTwitterHandle?: string;
  creatorDisplayName?: string | null;
}

export interface AhListing {
  id: Uuid;
  tradeState: string;
  auctionHouse?: AuctionHouse;
  seller: string;
  metadata: string;
  purchaseId?: Uuid;
  price: BN;
  tokenSize: number;
  tradeStateBump: number;
  createdAt: string;
  canceledAt?: string;
  nft?: Nft;
}

export interface Purchase {
  id: Uuid;
  buyer: string;
  seller: string;
  auctionHouse?: AuctionHouse;
  metadata: string;
  price: BN;
  createdAt: string;
  tokenSize: number;
  nft?: Nft;
}

export interface Offer {
  id: Uuid;
  tradeState: string;
  buyer: string;
  metadata: string;
  auctionHouse?: AuctionHouse;
  price: BN;
  purchaseId?: Uuid;
  tradeStateBump: number;
  tokenAccount?: string;
  createdAt: string;
  canceledAt?: string;
  tokenSize: number;
  nft?: Nft;
}

export interface NftFile {
  metadataAddress: string;
  fileType: string;
  uri: string;
}

export interface Nft {
  address: string;
  name: string;
  sellerFeeBasisPoints: number;
  royalties: number;
  mintAddress: string;
  shortAddress: string;
  shortMintAddress: string;
  primarySaleHappened: boolean;
  updateAuthorityAddress: string;
  description: string;
  category: string;
  image: string;
  animationUrl?: string;
  externalUrl?: string;
  creators: NftCreator[];
  attributes?: NftAttribute[];
  owner: NftOwner;
  activities?: Activity[];
  listings?: AhListing[];
  purchases?: Purchase[];
  offers?: Offer[];
  files?: NftFile[];
  collection?: Collection;
  createdAt?: string;
  parser?: string;
}

export interface AttributeFilter {
  traitType: string;
  values: string[];
}

export enum PresetNftFilter {
  All = 'All',
  Listed = 'Listed',
  Owned = 'Owned',
  OpenOffers = 'OpenOffers',
}

export interface Viewer extends GraphQLObject {
  id: string;
  balance: number;
}

export enum PresetEditFilter {
  Marketplace = 'Marketplace',
  Creators = 'Creators',
}

export enum ActivityType {
  Listed = 'listing',
  Sold = 'purchase',
}
export interface Activity {
  id: Uuid;
  metadata: string;
  auctionHouse?: AuctionHouse;
  price: BN;
  solPrice: number;
  createdAt: string;
  wallets: Wallet[];
  activityType: string;
  marketplaceProgramAddress: string;
  nft?: Nft;
}

export interface TwitterProfile {
  handle: string;
  description?: string;
  walletAddress?: string;
  bannerImageUrl?: string;
  /**
   * @deprecated
   */
  profileImageUrl?: string;
  profileImageUrlLowres?: string;
  profileImageUrlHighres?: string;
}

export interface NftCount {
  total: number;
  listed: number;
}

export interface NftOwner extends UserWallet {
  associatedTokenAccountAddress: string;
  twitterHandle: string;
}
export interface Wallet extends UserWallet {
  nftCounts: WalletNftCount;
  connectionCounts: ConnectionCounts;
  compactFollowerCount: string;
  compactFollowingCount: string;
  compactOwnedCount: string;
  compactCreatedCount: string;
  portfolioValue: number;
}

export interface WalletNftCount {
  owned: number;
  offered: number;
  listed: number;
  created: number;
}

export interface ConnectionCounts {
  fromCount: number;
  toCount: number;
}

export interface PricePoint {
  price: BN;
  date: string;
}

export interface PriceChart {
  listingFloor: PricePoint[];
  salesAverage: PricePoint[];
  totalVolume: PricePoint[];
}

export interface Collection {
  floorPrice: number;
  nftCount: string;
  nft: Nft;
  activities: Activity[];
  volumeTotal: number;
  listedCount: string;
  holderCount: string;
}

export interface GraphConnection {
  address: string;
  connectedAt?: string;
  from?: Wallet;
  to?: Wallet;
}
