export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** DateTime */
  DateTimeUtc: any;
  /** I64 */
  I64: any;
  /** NaiveDateTime */
  NaiveDateTime: any;
  /** Numeric data type */
  Numeric: any;
  /** PublicKey */
  PublicKey: any;
  /** U64 */
  U64: any;
  /** Uuid */
  Uuid: any;
};

export type AhListing = {
  __typename?: 'AhListing';
  auctionHouse?: Maybe<AuctionHouse>;
  canceledAt?: Maybe<Scalars['DateTimeUtc']>;
  createdAt: Scalars['DateTimeUtc'];
  id: Scalars['Uuid'];
  marketplaceProgramAddress: Scalars['String'];
  metadata: Scalars['PublicKey'];
  nft?: Maybe<Nft>;
  nftMarketplace?: Maybe<NftMarketplace>;
  price: Scalars['U64'];
  purchaseId?: Maybe<Scalars['Uuid']>;
  seller: Scalars['PublicKey'];
  solPrice?: Maybe<Scalars['Int']>;
  tokenSize: Scalars['Int'];
  tradeState: Scalars['String'];
  tradeStateBump: Scalars['Int'];
};

export type AssociatedTokenAccount = {
  __typename?: 'AssociatedTokenAccount';
  address: Scalars['PublicKey'];
  amount: Scalars['U64'];
  mint: Scalars['PublicKey'];
  owner: Scalars['PublicKey'];
};

/** Filter on NFT attributes */
export type AttributeFilter = {
  traitType: Scalars['String'];
  values: Array<Scalars['String']>;
};

export type AttributeGroup = {
  __typename?: 'AttributeGroup';
  name: Scalars['String'];
  variants: Array<AttributeVariant>;
};

export type AttributeVariant = {
  __typename?: 'AttributeVariant';
  count: Scalars['Int'];
  name: Scalars['String'];
};

export type AuctionHouse = {
  __typename?: 'AuctionHouse';
  address: Scalars['PublicKey'];
  auctionHouseFeeAccount: Scalars['String'];
  auctionHouseTreasury: Scalars['String'];
  authority: Scalars['String'];
  bump: Scalars['Int'];
  canChangeSalePrice: Scalars['Boolean'];
  creator: Scalars['String'];
  fee?: Maybe<Scalars['Int']>;
  feePayerBump: Scalars['Int'];
  feeWithdrawalDestination: Scalars['String'];
  requiresSignOff: Scalars['Boolean'];
  rewardCenter?: Maybe<RewardCenter>;
  sellerFeeBasisPoints: Scalars['Int'];
  stats?: Maybe<MintStats>;
  treasuryBump: Scalars['Int'];
  treasuryMint: Scalars['String'];
  treasuryWithdrawalDestination: Scalars['String'];
};

export type Bid = {
  __typename?: 'Bid';
  bidderAddress: Scalars['String'];
  cancelled: Scalars['Boolean'];
  lastBidAmount: Scalars['U64'];
  lastBidTime: Scalars['String'];
  listing?: Maybe<Listing>;
  listingAddress: Scalars['String'];
};

export type BidReceipt = {
  __typename?: 'BidReceipt';
  address: Scalars['String'];
  auctionHouse?: Maybe<AuctionHouse>;
  bookkeeper: Scalars['PublicKey'];
  bump: Scalars['Int'];
  buyer: Scalars['PublicKey'];
  canceledAt?: Maybe<Scalars['DateTimeUtc']>;
  createdAt: Scalars['DateTimeUtc'];
  metadata: Scalars['PublicKey'];
  nft?: Maybe<Nft>;
  price: Scalars['U64'];
  purchaseReceipt?: Maybe<Scalars['PublicKey']>;
  tokenAccount?: Maybe<Scalars['String']>;
  tokenSize: Scalars['Int'];
  tradeState: Scalars['String'];
  tradeStateBump: Scalars['Int'];
};

export type CandyMachine = {
  __typename?: 'CandyMachine';
  address: Scalars['PublicKey'];
  authority: Scalars['PublicKey'];
  collectionPda?: Maybe<CandyMachineCollectionPda>;
  /** NOTE - this is currently bugged and will always be empty */
  configLines: Array<CandyMachineConfigLine>;
  /** NOTE - this is currently bugged and will only return one creator */
  creators: Array<CandyMachineCreator>;
  endSetting?: Maybe<CandyMachineEndSetting>;
  gateKeeperConfig?: Maybe<CandyMachineGateKeeperConfig>;
  goLiveDate?: Maybe<Scalars['U64']>;
  hiddenSetting?: Maybe<CandyMachineHiddenSetting>;
  isMutable: Scalars['Boolean'];
  itemsAvailable: Scalars['U64'];
  itemsRedeemed: Scalars['U64'];
  maxSupply: Scalars['U64'];
  price: Scalars['U64'];
  retainAuthority: Scalars['Boolean'];
  sellerFeeBasisPoints: Scalars['Int'];
  symbol: Scalars['String'];
  tokenMint?: Maybe<Scalars['PublicKey']>;
  uuid: Scalars['String'];
  wallet: Scalars['PublicKey'];
  whitelistMintSetting?: Maybe<CandyMachineWhitelistMintSetting>;
};

export type CandyMachineCollectionPda = {
  __typename?: 'CandyMachineCollectionPda';
  candyMachineAddress: Scalars['PublicKey'];
  collectionPda: Scalars['PublicKey'];
  mint: Scalars['PublicKey'];
};

export type CandyMachineConfigLine = {
  __typename?: 'CandyMachineConfigLine';
  candyMachineAddress: Scalars['PublicKey'];
  idx: Scalars['Int'];
  name: Scalars['String'];
  taken: Scalars['Boolean'];
  uri: Scalars['String'];
};

export type CandyMachineCreator = {
  __typename?: 'CandyMachineCreator';
  candyMachineAddress: Scalars['PublicKey'];
  creatorAddress: Scalars['PublicKey'];
  share: Scalars['Int'];
  verified: Scalars['Boolean'];
};

export type CandyMachineEndSetting = {
  __typename?: 'CandyMachineEndSetting';
  candyMachineAddress: Scalars['PublicKey'];
  endSettingType: CandyMachineEndSettingType;
  number: Scalars['U64'];
};

export enum CandyMachineEndSettingType {
  Amount = 'AMOUNT',
  Date = 'DATE'
}

export type CandyMachineGateKeeperConfig = {
  __typename?: 'CandyMachineGateKeeperConfig';
  candyMachineAddress: Scalars['PublicKey'];
  expireOnUse: Scalars['Boolean'];
  gatekeeperNetwork: Scalars['String'];
};

export type CandyMachineHiddenSetting = {
  __typename?: 'CandyMachineHiddenSetting';
  candyMachineAddress: Scalars['PublicKey'];
  /** lowercase base64 encoded string of the hash bytes */
  hash: Scalars['String'];
  name: Scalars['String'];
  uri: Scalars['String'];
};

export enum CandyMachineWhitelistMintMode {
  BurnEveryTime = 'BURN_EVERY_TIME',
  NeverBurn = 'NEVER_BURN'
}

export type CandyMachineWhitelistMintSetting = {
  __typename?: 'CandyMachineWhitelistMintSetting';
  candyMachineAddress: Scalars['PublicKey'];
  discountPrice?: Maybe<Scalars['U64']>;
  mint: Scalars['PublicKey'];
  mode: CandyMachineWhitelistMintMode;
  presale: Scalars['Boolean'];
};

export type CollectedCollection = {
  __typename?: 'CollectedCollection';
  collection?: Maybe<Collection>;
  estimatedValue: Scalars['Numeric'];
  nftsOwned: Scalars['Int'];
};

export type Collection = {
  __typename?: 'Collection';
  activities: Array<NftActivity>;
  attributeGroups: Array<AttributeGroup>;
  compactFloor1d?: Maybe<Scalars['String']>;
  compactPieces?: Maybe<Scalars['String']>;
  compactVolume30d?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTimeUtc'];
  description: Scalars['String'];
  discordUrl?: Maybe<Scalars['String']>;
  goLiveAt: Scalars['DateTimeUtc'];
  /** Count of wallets that currently hold at least one NFT from the collection. */
  holderCount?: Maybe<Scalars['I64']>;
  id: Scalars['String'];
  image: Scalars['String'];
  /** Get the original URL of the image as stored in the NFT's metadata */
  imageOriginal: Scalars['String'];
  magicEdenId?: Maybe<Scalars['String']>;
  marketCap?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  nfts: Array<Nft>;
  pieces: Scalars['Int'];
  shortVerifiedCollectionAddress?: Maybe<Scalars['String']>;
  timeseries: Timeseries;
  trends?: Maybe<CollectionTrend>;
  twitterUrl?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTimeUtc'];
  verified: Scalars['Boolean'];
  verifiedCollectionAddress?: Maybe<Scalars['String']>;
  websiteUrl?: Maybe<Scalars['String']>;
};


export type CollectionActivitiesArgs = {
  eventTypes?: InputMaybe<Array<Scalars['String']>>;
  limit: Scalars['Int'];
  offset: Scalars['Int'];
};


export type CollectionImageArgs = {
  width?: InputMaybe<Scalars['Int']>;
};


export type CollectionNftsArgs = {
  attributes?: InputMaybe<Array<AttributeFilter>>;
  auctionHouse?: InputMaybe<Scalars['String']>;
  limit: Scalars['Int'];
  marketplaceProgram?: InputMaybe<Scalars['String']>;
  offset: Scalars['Int'];
  order?: InputMaybe<OrderDirection>;
  sortBy?: InputMaybe<NftSort>;
};


export type CollectionTimeseriesArgs = {
  endTime: Scalars['DateTimeUtc'];
  startTime: Scalars['DateTimeUtc'];
};

export type CollectionDocument = {
  __typename?: 'CollectionDocument';
  discordUrl?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  image: Scalars['String'];
  magicEdenId?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  twitterUrl?: Maybe<Scalars['String']>;
  verifiedCollectionAddress?: Maybe<Scalars['String']>;
  websiteUrl?: Maybe<Scalars['String']>;
};

/** Collection intervals */
export enum CollectionInterval {
  OneDay = 'ONE_DAY',
  SevenDay = 'SEVEN_DAY',
  ThirtyDay = 'THIRTY_DAY'
}

export type CollectionNft = {
  __typename?: 'CollectionNFT';
  activities: Array<NftActivity>;
  /** @deprecated use `nft { address }` */
  address: Scalars['String'];
  /** @deprecated use `nft { animation_url }` */
  animationUrl?: Maybe<Scalars['String']>;
  attributeGroups: Array<AttributeGroup>;
  /** @deprecated use `nft { attributes }` */
  attributes: Array<NftAttribute>;
  /** @deprecated use `nft { category }` */
  category: Scalars['String'];
  /** @deprecated use `nft { created_at }` */
  createdAt?: Maybe<Scalars['DateTimeUtc']>;
  /** @deprecated use `nft { creators }` */
  creators: Array<NftCreator>;
  /** @deprecated use `nft { description }` */
  description: Scalars['String'];
  /** @deprecated use `nft { external_url }` */
  externalUrl?: Maybe<Scalars['String']>;
  /** @deprecated use `nft { files }` */
  files: Array<NftFile>;
  /** Lowest price of currently listed NFTs in the collection. */
  floorPrice?: Maybe<Scalars['I64']>;
  /** Count of wallets that currently hold at least one NFT from the collection. */
  holderCount?: Maybe<Scalars['I64']>;
  /** @deprecated use `nft { image }` */
  image: Scalars['String'];
  /** Count of active listings of NFTs in the collection. */
  listedCount: Scalars['U64'];
  /** @deprecated use `nft { ah_listings_loader }` */
  listings: Array<AhListing>;
  /** @deprecated use `nft { mint_address }` */
  mintAddress: Scalars['String'];
  /** @deprecated use `nft { name }` */
  name: Scalars['String'];
  nft: Nft;
  /** Count of NFTs in the collection. */
  nftCount?: Maybe<Scalars['I64']>;
  nfts: Array<Nft>;
  /** @deprecated use `nft { offers }` */
  offers: Array<Offer>;
  /** @deprecated use `nft { owner }` */
  owner?: Maybe<NftOwner>;
  /** @deprecated use `nft { parser }` */
  parser?: Maybe<Scalars['String']>;
  /** @deprecated use `nft { primary_sale_happened }` */
  primarySaleHappened: Scalars['Boolean'];
  /** @deprecated use `nft { purchases }` */
  purchases: Array<Purchase>;
  /** @deprecated use `nft { seller_fee_basis_points }` */
  sellerFeeBasisPoints: Scalars['Int'];
  /** @deprecated use `nft { token_account_address }` */
  tokenAccountAddress: Scalars['String'];
  /** @deprecated use `nft { update_authority_address }` */
  updateAuthorityAddress: Scalars['String'];
  /** Total of all sales of all NFTs in the collection over all time, in lamports. */
  volumeTotal?: Maybe<Scalars['U64']>;
};


export type CollectionNftActivitiesArgs = {
  eventTypes?: InputMaybe<Array<Scalars['String']>>;
  limit: Scalars['Int'];
  offset: Scalars['Int'];
};


export type CollectionNftImageArgs = {
  width?: InputMaybe<Scalars['Int']>;
};


export type CollectionNftNftsArgs = {
  attributes?: InputMaybe<Array<AttributeFilter>>;
  auctionHouse?: InputMaybe<Scalars['String']>;
  limit: Scalars['Int'];
  marketplaceProgram?: InputMaybe<Scalars['String']>;
  offset: Scalars['Int'];
  order?: InputMaybe<OrderDirection>;
  sortBy?: InputMaybe<NftSort>;
};

/** Sorts collection results */
export enum CollectionSort {
  Floor = 'FLOOR',
  NumberListed = 'NUMBER_LISTED',
  Volume = 'VOLUME'
}

export type CollectionTrend = {
  __typename?: 'CollectionTrend';
  changeFloor1d?: Maybe<Scalars['Int']>;
  changeFloor7d?: Maybe<Scalars['Int']>;
  changeFloor30d?: Maybe<Scalars['Int']>;
  changeListed1d?: Maybe<Scalars['Int']>;
  changeListed7d?: Maybe<Scalars['Int']>;
  changeListed30d?: Maybe<Scalars['Int']>;
  changeVolume1d?: Maybe<Scalars['Int']>;
  changeVolume7d?: Maybe<Scalars['Int']>;
  changeVolume30d?: Maybe<Scalars['Int']>;
  collection?: Maybe<Collection>;
  compactFloor1d?: Maybe<Scalars['String']>;
  compactFloor7d?: Maybe<Scalars['String']>;
  compactFloor30d?: Maybe<Scalars['String']>;
  compactListed1d?: Maybe<Scalars['String']>;
  compactListed7d?: Maybe<Scalars['String']>;
  compactListed30d?: Maybe<Scalars['String']>;
  compactVolume1d?: Maybe<Scalars['String']>;
  compactVolume7d?: Maybe<Scalars['String']>;
  compactVolume30d?: Maybe<Scalars['String']>;
  floor1d: Scalars['Numeric'];
  floor7d: Scalars['Numeric'];
  floor30d: Scalars['Numeric'];
  lastFloor1d: Scalars['Numeric'];
  lastFloor7d: Scalars['Numeric'];
  lastFloor30d: Scalars['Numeric'];
  lastListed1d: Scalars['I64'];
  lastListed7d: Scalars['I64'];
  lastListed30d: Scalars['I64'];
  lastVolume1d: Scalars['Numeric'];
  lastVolume7d: Scalars['Numeric'];
  lastVolume30d: Scalars['Numeric'];
  listed1d: Scalars['I64'];
  listed7d: Scalars['I64'];
  listed30d: Scalars['I64'];
  volume1d: Scalars['Numeric'];
  volume7d: Scalars['Numeric'];
  volume30d: Scalars['Numeric'];
};

export type ConnectionCounts = {
  __typename?: 'ConnectionCounts';
  fromCount: Scalars['Int'];
  toCount: Scalars['Int'];
};

export type Creator = {
  __typename?: 'Creator';
  address: Scalars['String'];
  attributeGroups: Array<AttributeGroup>;
  counts: CreatorCounts;
  profile?: Maybe<TwitterProfile>;
  stats: Array<MintStats>;
};


export type CreatorStatsArgs = {
  auctionHouses: Array<Scalars['PublicKey']>;
};

export type CreatorCounts = {
  __typename?: 'CreatorCounts';
  creations: Scalars['Int'];
};

export type Datapoint = {
  __typename?: 'Datapoint';
  timestamp: Scalars['DateTimeUtc'];
  value: Scalars['U64'];
};

export type Denylist = {
  __typename?: 'Denylist';
  listings: Array<Scalars['PublicKey']>;
  storefronts: Array<Scalars['PublicKey']>;
};

/** Bonding change enriched with reserve change and supply change */
export type EnrichedBondingChange = {
  __typename?: 'EnrichedBondingChange';
  address: Scalars['String'];
  insertTs: Scalars['NaiveDateTime'];
  reserveChange: Scalars['I64'];
  slot: Scalars['U64'];
  supplyChange: Scalars['I64'];
};

export type FeedEvent = FollowEvent | ListingEvent | MintEvent | OfferEvent | PurchaseEvent;

export type FollowEvent = {
  __typename?: 'FollowEvent';
  connection?: Maybe<GraphConnection>;
  createdAt: Scalars['DateTimeUtc'];
  feedEventId: Scalars['String'];
  graphConnectionAddress: Scalars['PublicKey'];
  profile?: Maybe<TwitterProfile>;
  wallet: Wallet;
  walletAddress: Scalars['PublicKey'];
};

export type GenoHabitat = {
  __typename?: 'GenoHabitat';
  active: Scalars['Boolean'];
  address: Scalars['PublicKey'];
  crystalsRefined: Scalars['Int'];
  dailyKiHarvestingCap: Scalars['U64'];
  durability: Scalars['Int'];
  element: Scalars['Int'];
  expiryTimestamp: Scalars['DateTimeUtc'];
  genesis: Scalars['Boolean'];
  guild?: Maybe<Scalars['Int']>;
  habitatMint: Scalars['PublicKey'];
  habitatsTerraformed: Scalars['Int'];
  harvester: Scalars['String'];
  harvesterOpenMarket: Scalars['Boolean'];
  harvesterRoyaltyBips: Scalars['Int'];
  harvesterSettingsCooldownTimestamp: Scalars['DateTimeUtc'];
  hasMaxKi?: Maybe<Scalars['Boolean']>;
  isSubHabitat: Scalars['Boolean'];
  kiAvailableToHarvest?: Maybe<Scalars['U64']>;
  kiHarvested: Scalars['U64'];
  level: Scalars['Int'];
  nextDayTimestamp: Scalars['DateTimeUtc'];
  nft?: Maybe<Nft>;
  parentHabitat?: Maybe<Scalars['PublicKey']>;
  parentHabitatData?: Maybe<GenoHabitat>;
  renewalTimestamp: Scalars['DateTimeUtc'];
  rentalAgreement?: Maybe<GenoRentalAgreement>;
  seedsSpawned: Scalars['Boolean'];
  sequence: Scalars['I64'];
  subHabitatCooldownTimestamp: Scalars['DateTimeUtc'];
  subHabitatData: Array<Maybe<GenoHabitat>>;
  subHabitats: Array<Scalars['PublicKey']>;
  terraformingHabitat?: Maybe<Scalars['PublicKey']>;
  totalCrystalsRefined: Scalars['I64'];
  totalKiHarvested: Scalars['I64'];
};

/** A list of Genopets habitats */
export type GenoHabitatList = {
  __typename?: 'GenoHabitatList';
  habitats: Array<GenoHabitat>;
  totalCountHint?: Maybe<Scalars['I64']>;
};

/** Input sorting parameter for the `genoHabitatsCounted` query */
export enum GenoHabitatSortField {
  /** Sort by the `address` field */
  Address = 'ADDRESS',
  /** Sort by the `crystalsRefined` field */
  CrystalsRefined = 'CRYSTALS_REFINED',
  /** Sort by the `kiAvailableToHarvest` field */
  KiAvailableToHarvest = 'KI_AVAILABLE_TO_HARVEST',
  /** Sort by the `kiHarvested` field */
  KiHarvested = 'KI_HARVESTED',
  /** Sort by the `level` field */
  Level = 'LEVEL',
  /** Sort by the `expiryTimestamp` field */
  Lifespan = 'LIFESPAN',
  /** Sort by the `totalKiHarvested` field */
  TotalKiHarvested = 'TOTAL_KI_HARVESTED'
}

/** Input parameters for the `genoHabitatsCounted` query */
export type GenoHabitatsParams = {
  /** Filter by elements */
  elements?: InputMaybe<Array<Scalars['Int']>>;
  /** Filter by genesis (or non-genesis) */
  genesis?: InputMaybe<Scalars['Boolean']>;
  /** Filter by guild IDs */
  guilds?: InputMaybe<Array<Scalars['Int']>>;
  /** Filter by open (or closed) market */
  harvesterOpenMarket?: InputMaybe<Scalars['Boolean']>;
  /** Filter by harvester addresses */
  harvesters?: InputMaybe<Array<Scalars['String']>>;
  hasAlchemist?: InputMaybe<Scalars['Boolean']>;
  hasHarvester?: InputMaybe<Scalars['Boolean']>;
  hasMaxKi?: InputMaybe<Scalars['Boolean']>;
  isActivated?: InputMaybe<Scalars['Boolean']>;
  /** Maximum number of results to return (max 250) */
  limit: Scalars['Int'];
  /** Maximum habitat durability to return */
  maxDurability?: InputMaybe<Scalars['Int']>;
  /** Maximum habitat expiry timestamp to return */
  maxExpiry?: InputMaybe<Scalars['DateTimeUtc']>;
  /** Maximum habitat level to return */
  maxLevel?: InputMaybe<Scalars['Int']>;
  /** Maximum habitat sequence number to return */
  maxSequence?: InputMaybe<Scalars['Int']>;
  /** Minimum habitat durability to return */
  minDurability?: InputMaybe<Scalars['Int']>;
  /** Minimum habitat expiry timestamp to return */
  minExpiry?: InputMaybe<Scalars['DateTimeUtc']>;
  /** Minimum habitat level to return */
  minLevel?: InputMaybe<Scalars['Int']>;
  /** Minimum habitat sequence number to return */
  minSequence?: InputMaybe<Scalars['Int']>;
  /** Filter by habitat NFT addresses */
  mints?: InputMaybe<Array<Scalars['PublicKey']>>;
  /** Pagination offset */
  offset: Scalars['Int'];
  /** Filter by habitat NFT owners */
  owners?: InputMaybe<Array<Scalars['PublicKey']>>;
  /** Filter by rental open (or closed) market */
  rentalOpenMarket?: InputMaybe<Scalars['Boolean']>;
  /** Filter by renter addresses */
  renters?: InputMaybe<Array<Scalars['PublicKey']>>;
  /** True to sort results in descending order (default false) */
  sortDesc?: InputMaybe<Scalars['Boolean']>;
  /** Field to sort results by (default `ADDRESS`) */
  sortField?: InputMaybe<GenoHabitatSortField>;
  /** Filter habitats by a fuzzy text-search query */
  term?: InputMaybe<Scalars['String']>;
};

export type GenoRentalAgreement = {
  __typename?: 'GenoRentalAgreement';
  alchemist?: Maybe<Scalars['PublicKey']>;
  gracePeriod: Scalars['I64'];
  habitatAddress: Scalars['PublicKey'];
  lastRentPayment: Scalars['DateTimeUtc'];
  nextPaymentDue: Scalars['DateTimeUtc'];
  openMarket: Scalars['Boolean'];
  rent: Scalars['I64'];
  rentToken: Scalars['PublicKey'];
  rentTokenDecimals: Scalars['Int'];
  rentalPeriod: Scalars['I64'];
};

export type Governance = {
  __typename?: 'Governance';
  accountType: GovernanceAccountType;
  address: Scalars['PublicKey'];
  governanceConfig?: Maybe<GovernanceConfig>;
  governedAccount: Scalars['PublicKey'];
  proposalsCount: Scalars['I64'];
  realm?: Maybe<Realm>;
  votingProposalCount: Scalars['Int'];
};

export enum GovernanceAccountType {
  GovernanceV1 = 'GOVERNANCE_V1',
  GovernanceV2 = 'GOVERNANCE_V2',
  MintGovernanceV1 = 'MINT_GOVERNANCE_V1',
  MintGovernanceV2 = 'MINT_GOVERNANCE_V2',
  ProgramGovernanceV1 = 'PROGRAM_GOVERNANCE_V1',
  ProgramGovernanceV2 = 'PROGRAM_GOVERNANCE_V2',
  ProgramMetadata = 'PROGRAM_METADATA',
  ProposalInstructionV1 = 'PROPOSAL_INSTRUCTION_V1',
  ProposalTransactionV2 = 'PROPOSAL_TRANSACTION_V2',
  ProposalV1 = 'PROPOSAL_V1',
  ProposalV2 = 'PROPOSAL_V2',
  RealmConfig = 'REALM_CONFIG',
  RealmV1 = 'REALM_V1',
  RealmV2 = 'REALM_V2',
  SignatoryRecordV1 = 'SIGNATORY_RECORD_V1',
  SignatoryRecordV2 = 'SIGNATORY_RECORD_V2',
  TokenGovernanceV1 = 'TOKEN_GOVERNANCE_V1',
  TokenGovernanceV2 = 'TOKEN_GOVERNANCE_V2',
  TokenOwnerRecordV1 = 'TOKEN_OWNER_RECORD_V1',
  TokenOwnerRecordV2 = 'TOKEN_OWNER_RECORD_V2',
  Uninitialized = 'UNINITIALIZED',
  VoteRecordV1 = 'VOTE_RECORD_V1',
  VoteRecordV2 = 'VOTE_RECORD_V2'
}

export type GovernanceConfig = {
  __typename?: 'GovernanceConfig';
  governanceAddress: Scalars['PublicKey'];
  maxVotingTime: Scalars['I64'];
  minCommunityWeightToCreateProposal: Scalars['U64'];
  minCouncilWeightToCreateProposal: Scalars['I64'];
  minInstructionHoldUpTime: Scalars['I64'];
  proposalCoolOffTime: Scalars['I64'];
  voteThresholdPercentage: Scalars['Int'];
  voteThresholdType: VoteThreshold;
  voteTipping: VoteTipping;
};

export type GraphConnection = {
  __typename?: 'GraphConnection';
  address: Scalars['String'];
  connectedAt: Scalars['DateTimeUtc'];
  from: Wallet;
  to: Wallet;
};

export enum InstructionExecutionFlags {
  None = 'NONE',
  Ordered = 'ORDERED',
  UseTransaction = 'USE_TRANSACTION'
}

export type LastSale = {
  __typename?: 'LastSale';
  createdAt?: Maybe<Scalars['DateTimeUtc']>;
  price?: Maybe<Scalars['U64']>;
  purchase?: Maybe<Purchase>;
  solPrice?: Maybe<Scalars['Int']>;
};

export type Listing = {
  __typename?: 'Listing';
  address: Scalars['String'];
  bids: Array<Bid>;
  cacheAddress: Scalars['String'];
  ended: Scalars['Boolean'];
  endsAt?: Maybe<Scalars['DateTimeUtc']>;
  extAddress: Scalars['String'];
  nfts: Array<Nft>;
  storeAddress: Scalars['String'];
  storefront?: Maybe<Storefront>;
};

export type ListingEvent = {
  __typename?: 'ListingEvent';
  createdAt: Scalars['DateTimeUtc'];
  feedEventId: Scalars['String'];
  lifecycle: Scalars['String'];
  listing?: Maybe<AhListing>;
  listingId: Scalars['Uuid'];
  profile?: Maybe<TwitterProfile>;
  wallet: Wallet;
  walletAddress: Scalars['PublicKey'];
};

export type MarketStats = {
  __typename?: 'MarketStats';
  nfts?: Maybe<Scalars['U64']>;
};

export type Marketplace = {
  __typename?: 'Marketplace';
  auctionHouses: Array<AuctionHouse>;
  bannerUrl: Scalars['String'];
  configAddress: Scalars['PublicKey'];
  creators: Array<StoreCreator>;
  description: Scalars['String'];
  logoUrl: Scalars['String'];
  name: Scalars['String'];
  ownerAddress: Scalars['String'];
  stats?: Maybe<MarketStats>;
  storeAddress?: Maybe<Scalars['PublicKey']>;
  subdomain: Scalars['String'];
};

export type MetadataJson = {
  __typename?: 'MetadataJson';
  address: Scalars['String'];
  creatorAddress?: Maybe<Scalars['String']>;
  creatorDisplayName?: Maybe<Scalars['String']>;
  creatorTwitterHandle?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['String']>;
  mintAddress: Scalars['String'];
  name: Scalars['String'];
};

export type MintEvent = {
  __typename?: 'MintEvent';
  createdAt: Scalars['DateTimeUtc'];
  feedEventId: Scalars['String'];
  metadataAddress: Scalars['PublicKey'];
  nft?: Maybe<Nft>;
  profile?: Maybe<TwitterProfile>;
  wallet: Wallet;
  walletAddress: Scalars['PublicKey'];
};

export enum MintMaxVoteWeightSource {
  Absolute = 'ABSOLUTE',
  SupplyFraction = 'SUPPLY_FRACTION'
}

export type MintStats = {
  __typename?: 'MintStats';
  auctionHouse?: Maybe<AuctionHouse>;
  average?: Maybe<Scalars['U64']>;
  floor?: Maybe<Scalars['U64']>;
  mint: Scalars['String'];
  volume24hr?: Maybe<Scalars['U64']>;
  volumeTotal?: Maybe<Scalars['U64']>;
};

export type MultiChoice = {
  __typename?: 'MultiChoice';
  maxVoterOptions: Scalars['Int'];
  maxWinningOptions: Scalars['Int'];
};

export type Nft = {
  __typename?: 'Nft';
  activities: Array<NftActivity>;
  address: Scalars['String'];
  animationUrl?: Maybe<Scalars['String']>;
  attributes: Array<NftAttribute>;
  category: Scalars['String'];
  collection?: Maybe<CollectionNft>;
  createdAt?: Maybe<Scalars['DateTimeUtc']>;
  creators: Array<NftCreator>;
  description: Scalars['String'];
  externalUrl?: Maybe<Scalars['String']>;
  files: Array<NftFile>;
  highestOffer?: Maybe<Offer>;
  image: Scalars['String'];
  /** Get the original URL of the image as stored in the NFT's metadata */
  imageOriginal: Scalars['String'];
  lastSale?: Maybe<LastSale>;
  listing?: Maybe<AhListing>;
  listings: Array<AhListing>;
  mintAddress: Scalars['String'];
  moonrankCollection?: Maybe<Collection>;
  moonrankRank?: Maybe<Scalars['I64']>;
  name: Scalars['String'];
  offers: Array<Offer>;
  owner?: Maybe<NftOwner>;
  /**
   * The JSON parser with which the NFT was processed by the indexer
   *
   * - `"full"` indicates the full Metaplex standard-compliant parser was
   *   used.
   * - `"minimal"` (provided with an optional description of an error)
   *   indicates the full model failed to parse and a more lenient fallback
   *   parser with fewer fields was used instead.
   */
  parser?: Maybe<Scalars['String']>;
  primarySaleHappened: Scalars['Boolean'];
  purchases: Array<Purchase>;
  royalties?: Maybe<Scalars['Int']>;
  sellerFeeBasisPoints: Scalars['Int'];
  shortAddress?: Maybe<Scalars['String']>;
  shortMintAddress?: Maybe<Scalars['String']>;
  tokenAccountAddress: Scalars['String'];
  updateAuthorityAddress: Scalars['String'];
  viewerOffer?: Maybe<Offer>;
};


export type NftImageArgs = {
  width?: InputMaybe<Scalars['Int']>;
};


export type NftViewerOfferArgs = {
  address?: InputMaybe<Scalars['String']>;
};

export type NftActivity = {
  __typename?: 'NftActivity';
  activityType: Scalars['String'];
  auctionHouse?: Maybe<AuctionHouse>;
  createdAt: Scalars['DateTimeUtc'];
  id: Scalars['Uuid'];
  marketplaceProgramAddress: Scalars['String'];
  metadata: Scalars['PublicKey'];
  nft?: Maybe<Nft>;
  nftMarketplace?: Maybe<NftMarketplace>;
  price: Scalars['U64'];
  primaryWallet: Wallet;
  solPrice?: Maybe<Scalars['Int']>;
  timeSince?: Maybe<Scalars['String']>;
  wallets: Array<Wallet>;
};

export type NftAttribute = {
  __typename?: 'NftAttribute';
  metadataAddress: Scalars['String'];
  traitType?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type NftCount = {
  __typename?: 'NftCount';
  listed: Scalars['Int'];
  total: Scalars['Int'];
};


export type NftCountListedArgs = {
  auctionHouses?: InputMaybe<Array<Scalars['PublicKey']>>;
};

export type NftCreator = {
  __typename?: 'NftCreator';
  address: Scalars['String'];
  compactCreatedCount?: Maybe<Scalars['String']>;
  compactFollowerCount?: Maybe<Scalars['String']>;
  compactFollowingCount?: Maybe<Scalars['String']>;
  compactOwnedCount?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  metadataAddress: Scalars['String'];
  portfolioValue?: Maybe<Scalars['Int']>;
  position?: Maybe<Scalars['Int']>;
  previewBanner?: Maybe<Scalars['String']>;
  previewImage?: Maybe<Scalars['String']>;
  profile?: Maybe<TwitterProfile>;
  share: Scalars['Int'];
  shortAddress?: Maybe<Scalars['String']>;
  twitterHandle?: Maybe<Scalars['String']>;
  verified: Scalars['Boolean'];
};

export type NftFile = {
  __typename?: 'NftFile';
  fileType: Scalars['String'];
  metadataAddress: Scalars['String'];
  uri: Scalars['String'];
};

export type NftMarketplace = {
  __typename?: 'NftMarketplace';
  auctionHouseAddress?: Maybe<Scalars['String']>;
  link?: Maybe<Scalars['String']>;
  logo?: Maybe<Scalars['String']>;
  marketplaceProgramAddress?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type NftOwner = {
  __typename?: 'NftOwner';
  address: Scalars['String'];
  associatedTokenAccountAddress: Scalars['String'];
  compactCreatedCount?: Maybe<Scalars['String']>;
  compactFollowerCount?: Maybe<Scalars['String']>;
  compactFollowingCount?: Maybe<Scalars['String']>;
  compactOwnedCount?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  portfolioValue?: Maybe<Scalars['Int']>;
  previewBanner?: Maybe<Scalars['String']>;
  previewImage?: Maybe<Scalars['String']>;
  profile?: Maybe<TwitterProfile>;
  shortAddress?: Maybe<Scalars['String']>;
  twitterHandle?: Maybe<Scalars['String']>;
};

/** Sorts results by price or listed at */
export enum NftSort {
  ListedAt = 'LISTED_AT',
  Price = 'PRICE'
}

export type NftsStats = {
  __typename?: 'NftsStats';
  /** The total number of buy-now listings */
  buyNowListings: Scalars['Int'];
  /** The total number of NFTs with active offers */
  nftsWithActiveOffers: Scalars['Int'];
  /** The total number of indexed NFTs */
  totalNfts: Scalars['Int'];
};

export type Offer = {
  __typename?: 'Offer';
  auctionHouse?: Maybe<AuctionHouse>;
  buyer: Scalars['PublicKey'];
  buyerWallet: Wallet;
  canceledAt?: Maybe<Scalars['DateTimeUtc']>;
  createdAt: Scalars['DateTimeUtc'];
  id: Scalars['Uuid'];
  marketplaceProgramAddress: Scalars['String'];
  metadata: Scalars['PublicKey'];
  nft?: Maybe<Nft>;
  nftMarketplace?: Maybe<NftMarketplace>;
  price: Scalars['U64'];
  purchaseId?: Maybe<Scalars['Uuid']>;
  solPrice?: Maybe<Scalars['Int']>;
  timeSince?: Maybe<Scalars['String']>;
  tokenAccount?: Maybe<Scalars['String']>;
  tokenSize: Scalars['Int'];
  tradeState: Scalars['String'];
  tradeStateBump: Scalars['Int'];
};

export type OfferEvent = {
  __typename?: 'OfferEvent';
  createdAt: Scalars['DateTimeUtc'];
  feedEventId: Scalars['String'];
  lifecycle: Scalars['String'];
  offer?: Maybe<Offer>;
  offerId: Scalars['Uuid'];
  profile?: Maybe<TwitterProfile>;
  wallet: Wallet;
  walletAddress: Scalars['PublicKey'];
};

/** Sorts results by price or listed at */
export enum OfferType {
  OfferPlaced = 'OFFER_PLACED',
  OfferReceived = 'OFFER_RECEIVED'
}

export enum OptionVoteResult {
  Defeated = 'DEFEATED',
  None = 'NONE',
  Succeeded = 'SUCCEEDED'
}

/** Sorts results ascending or descending */
export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

/** Reward center mathematical operands */
export enum PayoutOperation {
  Divide = 'DIVIDE',
  Multiple = 'MULTIPLE'
}

export type PriceChart = {
  __typename?: 'PriceChart';
  listingFloor: Array<PricePoint>;
  salesAverage: Array<PricePoint>;
  totalVolume: Array<PricePoint>;
};

export type PricePoint = {
  __typename?: 'PricePoint';
  date: Scalars['DateTimeUtc'];
  price: Scalars['U64'];
};

export type ProfilesStats = {
  __typename?: 'ProfilesStats';
  /** The total number of indexed profiles */
  totalProfiles: Scalars['Int'];
};

export type Proposal = ProposalV1 | ProposalV2;

export type ProposalOption = {
  __typename?: 'ProposalOption';
  label: Scalars['String'];
  proposalAddress: Scalars['PublicKey'];
  transactionsCount: Scalars['Int'];
  transactionsExecutedCount: Scalars['Int'];
  transactionsNextIndex: Scalars['Int'];
  voteResult: OptionVoteResult;
  voteWeight: Scalars['I64'];
};

export enum ProposalState {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Defeated = 'DEFEATED',
  Draft = 'DRAFT',
  Executing = 'EXECUTING',
  ExecutingWithErrors = 'EXECUTING_WITH_ERRORS',
  SigningOff = 'SIGNING_OFF',
  Succeeded = 'SUCCEEDED',
  Voting = 'VOTING'
}

export type ProposalV1 = {
  __typename?: 'ProposalV1';
  accountType: GovernanceAccountType;
  address: Scalars['PublicKey'];
  closedAt?: Maybe<Scalars['DateTimeUtc']>;
  description: Scalars['String'];
  draftAt: Scalars['DateTimeUtc'];
  executingAt?: Maybe<Scalars['DateTimeUtc']>;
  executionFlags: InstructionExecutionFlags;
  governance?: Maybe<Governance>;
  governingTokenMint: Scalars['PublicKey'];
  instructionsCount: Scalars['Int'];
  instructionsExecutedCount: Scalars['Int'];
  instructionsNextIndex: Scalars['Int'];
  maxVoteWeight?: Maybe<Scalars['I64']>;
  name: Scalars['String'];
  noVotesCount: Scalars['I64'];
  signatoriesCount: Scalars['Int'];
  signatoriesSignedOffCount: Scalars['Int'];
  signingOffAt?: Maybe<Scalars['DateTimeUtc']>;
  state: ProposalState;
  tokenOwnerRecord?: Maybe<TokenOwnerRecord>;
  voteThresholdPercentage?: Maybe<Scalars['Int']>;
  voteThresholdType?: Maybe<VoteThreshold>;
  votingAt?: Maybe<Scalars['DateTimeUtc']>;
  votingAtSlot?: Maybe<Scalars['I64']>;
  votingCompletedAt?: Maybe<Scalars['DateTimeUtc']>;
  yesVotesCount: Scalars['I64'];
};

export type ProposalV2 = {
  __typename?: 'ProposalV2';
  abstainVoteWeight?: Maybe<Scalars['I64']>;
  address: Scalars['PublicKey'];
  closedAt?: Maybe<Scalars['DateTimeUtc']>;
  denyVoteWeight?: Maybe<Scalars['I64']>;
  description: Scalars['String'];
  draftAt: Scalars['DateTimeUtc'];
  executingAt?: Maybe<Scalars['DateTimeUtc']>;
  executionFlags: InstructionExecutionFlags;
  governance?: Maybe<Governance>;
  governingTokenMint: Scalars['PublicKey'];
  maxVoteWeight?: Maybe<Scalars['I64']>;
  maxVotingTime?: Maybe<Scalars['I64']>;
  multiChoice?: Maybe<MultiChoice>;
  name: Scalars['String'];
  proposalOptions: Array<ProposalOption>;
  signatoriesCount: Scalars['Int'];
  signatoriesSignedOffCount: Scalars['Int'];
  signingOffAt?: Maybe<Scalars['DateTimeUtc']>;
  startVotingAt?: Maybe<Scalars['DateTimeUtc']>;
  state: ProposalState;
  tokenOwnerRecord?: Maybe<TokenOwnerRecord>;
  vetoVoteWeight?: Maybe<Scalars['I64']>;
  voteThresholdPercentage?: Maybe<Scalars['Int']>;
  voteThresholdType?: Maybe<VoteThreshold>;
  voteType: VoteType;
  votingAt?: Maybe<Scalars['DateTimeUtc']>;
  votingAtSlot?: Maybe<Scalars['I64']>;
  votingCompletedAt?: Maybe<Scalars['DateTimeUtc']>;
};

export type Purchase = {
  __typename?: 'Purchase';
  auctionHouse?: Maybe<AuctionHouse>;
  buyer: Scalars['PublicKey'];
  createdAt: Scalars['DateTimeUtc'];
  id: Scalars['Uuid'];
  marketplaceProgramAddress: Scalars['String'];
  metadata: Scalars['PublicKey'];
  nft?: Maybe<Nft>;
  price: Scalars['U64'];
  seller: Scalars['PublicKey'];
  solPrice?: Maybe<Scalars['String']>;
  tokenSize: Scalars['Int'];
};

export type PurchaseEvent = {
  __typename?: 'PurchaseEvent';
  createdAt: Scalars['DateTimeUtc'];
  feedEventId: Scalars['String'];
  profile?: Maybe<TwitterProfile>;
  purchase?: Maybe<Purchase>;
  purchaseId: Scalars['Uuid'];
  wallet: Wallet;
  walletAddress: Scalars['PublicKey'];
};

export type QueryRoot = {
  __typename?: 'QueryRoot';
  activities: Array<NftActivity>;
  associatedTokenAccounts: Array<AssociatedTokenAccount>;
  auctionHouse?: Maybe<AuctionHouse>;
  /** Get a candy machine by the candy machine config address */
  candyMachine?: Maybe<CandyMachine>;
  /** @deprecated Deprecated alias for candyMachine */
  candymachine?: Maybe<CandyMachine>;
  charts: PriceChart;
  /** Returns collection data along with collection activities */
  collection?: Maybe<Collection>;
  /** Returns featured collection NFTs ordered by market cap (floor price * number of NFTs in collection) */
  collectionTrends: Array<CollectionTrend>;
  /** Returns featured collection NFTs ordered by market cap (floor price * number of NFTs in collection) */
  collectionsFeaturedByMarketCap: Array<CollectionNft>;
  /** Returns featured collection NFTs ordered by volume (sum of purchase prices) */
  collectionsFeaturedByVolume: Array<CollectionNft>;
  connections: Array<GraphConnection>;
  creator: Creator;
  denylist: Denylist;
  enrichedBondingChanges: Array<EnrichedBondingChange>;
  featuredListings: Array<AhListing>;
  /** Returns events for the wallets the user is following using the graph_program. */
  feedEvents: Array<FeedEvent>;
  /** Recommend wallets to follow. */
  followWallets: Array<Wallet>;
  /** Query up to one Genopets habitat by the public key of its on-chain data */
  genoHabitat?: Maybe<GenoHabitat>;
  /** @deprecated Use genoHabitatsCounted instead */
  genoHabitats: Array<GenoHabitat>;
  /** Query zero or more Genopets habitats */
  genoHabitatsCounted: GenoHabitatList;
  governances: Array<Governance>;
  /** Returns the latest on chain events using the graph_program. */
  latestFeedEvents: Array<FeedEvent>;
  listings: Array<Listing>;
  /** A marketplace */
  marketplace?: Maybe<Marketplace>;
  /** Get multiple marketplaces; results will be in alphabetical order by subdomain */
  marketplaces: Array<Marketplace>;
  /** returns metadata_jsons matching the term */
  metadataJsons: Array<MetadataJson>;
  /** Get an NFT by metadata address. */
  nft?: Maybe<Nft>;
  /** Get an NFT by mint address. */
  nftByMintAddress?: Maybe<Nft>;
  nftCounts: NftCount;
  nfts: Array<Nft>;
  /** Get a list of NFTs by mint address. */
  nftsByMintAddress: Array<Nft>;
  /** Stats aggregated across all indexed NFTs */
  nftsStats: NftsStats;
  offer?: Maybe<BidReceipt>;
  profile?: Maybe<TwitterProfile>;
  /** returns profiles matching the search term */
  profiles: Array<Wallet>;
  /** returns stats about profiles */
  profilesStats: ProfilesStats;
  proposals: Array<Proposal>;
  realms: Array<Realm>;
  /** returns all the collections matching the search term */
  searchCollections: Array<CollectionDocument>;
  signatoryRecords: Array<SignatoryRecord>;
  /** A storefront */
  storefront?: Maybe<Storefront>;
  storefronts: Array<Storefront>;
  tokenOwnerRecords: Array<TokenOwnerRecord>;
  viewer?: Maybe<Viewer>;
  voteRecords: Array<VoteRecord>;
  wallet: Wallet;
  wallets: Array<Wallet>;
};


export type QueryRootActivitiesArgs = {
  auctionHouses: Array<Scalars['PublicKey']>;
  creators?: InputMaybe<Array<Scalars['PublicKey']>>;
};


export type QueryRootAssociatedTokenAccountsArgs = {
  limit: Scalars['Int'];
  mints: Array<Scalars['PublicKey']>;
  offset: Scalars['Int'];
};


export type QueryRootAuctionHouseArgs = {
  address: Scalars['String'];
};


export type QueryRootCandyMachineArgs = {
  address: Scalars['String'];
};


export type QueryRootCandymachineArgs = {
  addr: Scalars['String'];
};


export type QueryRootChartsArgs = {
  auctionHouses: Array<Scalars['PublicKey']>;
  creators?: InputMaybe<Array<Scalars['PublicKey']>>;
  endDate: Scalars['DateTimeUtc'];
  startDate: Scalars['DateTimeUtc'];
};


export type QueryRootCollectionArgs = {
  id: Scalars['String'];
};


export type QueryRootCollectionTrendsArgs = {
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  orderDirection?: InputMaybe<OrderDirection>;
  sortBy: CollectionSort;
  timeFrame: CollectionInterval;
};


export type QueryRootCollectionsFeaturedByMarketCapArgs = {
  endDate: Scalars['DateTimeUtc'];
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  orderDirection: OrderDirection;
  startDate: Scalars['DateTimeUtc'];
  term?: InputMaybe<Scalars['String']>;
};


export type QueryRootCollectionsFeaturedByVolumeArgs = {
  endDate: Scalars['DateTimeUtc'];
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  orderDirection: OrderDirection;
  startDate: Scalars['DateTimeUtc'];
  term?: InputMaybe<Scalars['String']>;
};


export type QueryRootConnectionsArgs = {
  from?: InputMaybe<Array<Scalars['PublicKey']>>;
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  to?: InputMaybe<Array<Scalars['PublicKey']>>;
};


export type QueryRootCreatorArgs = {
  address: Scalars['String'];
};


export type QueryRootEnrichedBondingChangesArgs = {
  address: Scalars['PublicKey'];
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  startUnixTime: Scalars['NaiveDateTime'];
  stopUnixTime: Scalars['NaiveDateTime'];
};


export type QueryRootFeaturedListingsArgs = {
  auctionHouses?: InputMaybe<Array<Scalars['PublicKey']>>;
  limit: Scalars['Int'];
  limitPerSeller?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  sellerExclusions?: InputMaybe<Array<Scalars['PublicKey']>>;
};


export type QueryRootFeedEventsArgs = {
  excludeTypes?: InputMaybe<Array<Scalars['String']>>;
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  wallet: Scalars['PublicKey'];
};


export type QueryRootFollowWalletsArgs = {
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  wallet?: InputMaybe<Scalars['PublicKey']>;
};


export type QueryRootGenoHabitatArgs = {
  address?: InputMaybe<Scalars['PublicKey']>;
  mint?: InputMaybe<Scalars['PublicKey']>;
};


export type QueryRootGenoHabitatsArgs = {
  elements?: InputMaybe<Array<Scalars['Int']>>;
  genesis?: InputMaybe<Scalars['Boolean']>;
  guilds?: InputMaybe<Array<Scalars['Int']>>;
  harvesterOpenMarket?: InputMaybe<Scalars['Boolean']>;
  harvesters?: InputMaybe<Array<Scalars['String']>>;
  hasAlchemist?: InputMaybe<Scalars['Boolean']>;
  hasHarvester?: InputMaybe<Scalars['Boolean']>;
  hasMaxKi?: InputMaybe<Scalars['Boolean']>;
  isActivated?: InputMaybe<Scalars['Boolean']>;
  limit: Scalars['Int'];
  maxDurability?: InputMaybe<Scalars['Int']>;
  maxExpiry?: InputMaybe<Scalars['DateTimeUtc']>;
  maxLevel?: InputMaybe<Scalars['Int']>;
  maxSequence?: InputMaybe<Scalars['Int']>;
  minDurability?: InputMaybe<Scalars['Int']>;
  minExpiry?: InputMaybe<Scalars['DateTimeUtc']>;
  minLevel?: InputMaybe<Scalars['Int']>;
  minSequence?: InputMaybe<Scalars['Int']>;
  mints?: InputMaybe<Array<Scalars['PublicKey']>>;
  offset: Scalars['Int'];
  owners?: InputMaybe<Array<Scalars['PublicKey']>>;
  rentalOpenMarket?: InputMaybe<Scalars['Boolean']>;
  renters?: InputMaybe<Array<Scalars['PublicKey']>>;
  term?: InputMaybe<Scalars['String']>;
};


export type QueryRootGenoHabitatsCountedArgs = {
  params: GenoHabitatsParams;
};


export type QueryRootGovernancesArgs = {
  addresses?: InputMaybe<Array<Scalars['PublicKey']>>;
  realms?: InputMaybe<Array<Scalars['PublicKey']>>;
};


export type QueryRootLatestFeedEventsArgs = {
  cursor: Scalars['String'];
  includeTypes?: InputMaybe<Array<Scalars['String']>>;
  isForward: Scalars['Boolean'];
  limit: Scalars['Int'];
};


export type QueryRootMarketplaceArgs = {
  subdomain: Scalars['String'];
};


export type QueryRootMarketplacesArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  subdomains?: InputMaybe<Array<Scalars['String']>>;
};


export type QueryRootMetadataJsonsArgs = {
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  term: Scalars['String'];
};


export type QueryRootNftArgs = {
  address: Scalars['String'];
};


export type QueryRootNftByMintAddressArgs = {
  address: Scalars['String'];
};


export type QueryRootNftCountsArgs = {
  creators: Array<Scalars['PublicKey']>;
};


export type QueryRootNftsArgs = {
  allowUnverified?: InputMaybe<Scalars['Boolean']>;
  attributes?: InputMaybe<Array<AttributeFilter>>;
  auctionHouses?: InputMaybe<Array<Scalars['PublicKey']>>;
  collection?: InputMaybe<Scalars['PublicKey']>;
  collections?: InputMaybe<Array<Scalars['PublicKey']>>;
  creators?: InputMaybe<Array<Scalars['PublicKey']>>;
  limit: Scalars['Int'];
  listed?: InputMaybe<Scalars['Boolean']>;
  offerers?: InputMaybe<Array<Scalars['PublicKey']>>;
  offset: Scalars['Int'];
  owners?: InputMaybe<Array<Scalars['PublicKey']>>;
  term?: InputMaybe<Scalars['String']>;
  updateAuthorities?: InputMaybe<Array<Scalars['PublicKey']>>;
  withOffers?: InputMaybe<Scalars['Boolean']>;
};


export type QueryRootNftsByMintAddressArgs = {
  addresses: Array<Scalars['PublicKey']>;
};


export type QueryRootOfferArgs = {
  address: Scalars['String'];
};


export type QueryRootProfileArgs = {
  handle: Scalars['String'];
};


export type QueryRootProfilesArgs = {
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  term: Scalars['String'];
};


export type QueryRootProposalsArgs = {
  addresses?: InputMaybe<Array<Scalars['PublicKey']>>;
  governances?: InputMaybe<Array<Scalars['PublicKey']>>;
};


export type QueryRootRealmsArgs = {
  addresses?: InputMaybe<Array<Scalars['PublicKey']>>;
  communityMints?: InputMaybe<Array<Scalars['PublicKey']>>;
};


export type QueryRootSearchCollectionsArgs = {
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  term: Scalars['String'];
};


export type QueryRootSignatoryRecordsArgs = {
  addresses?: InputMaybe<Array<Scalars['PublicKey']>>;
  proposals?: InputMaybe<Array<Scalars['PublicKey']>>;
};


export type QueryRootStorefrontArgs = {
  subdomain: Scalars['String'];
};


export type QueryRootTokenOwnerRecordsArgs = {
  addresses?: InputMaybe<Array<Scalars['PublicKey']>>;
  governingTokenMints?: InputMaybe<Array<Scalars['PublicKey']>>;
  realms?: InputMaybe<Array<Scalars['PublicKey']>>;
};


export type QueryRootVoteRecordsArgs = {
  addresses?: InputMaybe<Array<Scalars['PublicKey']>>;
  governingTokenOwners?: InputMaybe<Array<Scalars['PublicKey']>>;
  isRelinquished?: InputMaybe<Scalars['Boolean']>;
  proposals?: InputMaybe<Array<Scalars['PublicKey']>>;
};


export type QueryRootWalletArgs = {
  address: Scalars['PublicKey'];
};


export type QueryRootWalletsArgs = {
  addresses: Array<Scalars['PublicKey']>;
};

export type Realm = {
  __typename?: 'Realm';
  accountType: GovernanceAccountType;
  address: Scalars['PublicKey'];
  authority?: Maybe<Scalars['PublicKey']>;
  communityMint: Scalars['PublicKey'];
  name: Scalars['String'];
  realmConfig?: Maybe<RealmConfig>;
  votingProposalCount: Scalars['Int'];
};

export type RealmConfig = {
  __typename?: 'RealmConfig';
  communityMintMaxVoteWeight: Scalars['I64'];
  communityMintMaxVoteWeightSource: MintMaxVoteWeightSource;
  councilMint?: Maybe<Scalars['PublicKey']>;
  minCommunityWeightToCreateGovernance: Scalars['U64'];
  realmAddress: Scalars['PublicKey'];
  useCommunityVoterWeightAddin: Scalars['Boolean'];
  useMaxCommunityVoterWeightAddin: Scalars['Boolean'];
};

export type RewardCenter = {
  __typename?: 'RewardCenter';
  address: Scalars['PublicKey'];
  auctionHouse: Scalars['PublicKey'];
  bump: Scalars['Int'];
  mathematicalOperand: PayoutOperation;
  payoutNumeral: Scalars['Int'];
  payouts: Array<RewardPayout>;
  sellerRewardPayoutBasisPoints: Scalars['Int'];
  slot: Scalars['U64'];
  tokenMint: Scalars['PublicKey'];
  writeVersion: Scalars['U64'];
};


export type RewardCenterPayoutsArgs = {
  limit: Scalars['Int'];
  offset: Scalars['Int'];
};

export type RewardPayout = {
  __typename?: 'RewardPayout';
  buyer: Wallet;
  buyerReward: Scalars['U64'];
  createdAt: Scalars['NaiveDateTime'];
  nft?: Maybe<Nft>;
  purchaseTicket: Scalars['String'];
  rewardCenter: Scalars['PublicKey'];
  seller: Wallet;
  sellerReward: Scalars['U64'];
  slot: Scalars['U64'];
  writeVersion: Scalars['U64'];
};

export type SignatoryRecord = {
  __typename?: 'SignatoryRecord';
  accountType: GovernanceAccountType;
  address: Scalars['PublicKey'];
  proposal?: Maybe<Proposal>;
  signatory: Scalars['PublicKey'];
  signedOff: Scalars['Boolean'];
};

export type StoreCreator = {
  __typename?: 'StoreCreator';
  creatorAddress: Scalars['String'];
  nftCount?: Maybe<Scalars['Int']>;
  preview: Array<Nft>;
  profile?: Maybe<TwitterProfile>;
  storeConfigAddress: Scalars['String'];
  twitterHandle?: Maybe<Scalars['String']>;
};

/** A Metaplex storefront */
export type Storefront = {
  __typename?: 'Storefront';
  address: Scalars['String'];
  bannerUrl: Scalars['String'];
  description: Scalars['String'];
  faviconUrl: Scalars['String'];
  logoUrl: Scalars['String'];
  ownerAddress: Scalars['String'];
  subdomain: Scalars['String'];
  title: Scalars['String'];
};

export type Timeseries = {
  __typename?: 'Timeseries';
  floorPrice: Array<Datapoint>;
  holderCount: Array<Datapoint>;
  listedCount: Array<Datapoint>;
};

export type TokenOwnerRecord = {
  __typename?: 'TokenOwnerRecord';
  accountType: GovernanceAccountType;
  address: Scalars['PublicKey'];
  governanceDelegate?: Maybe<Scalars['PublicKey']>;
  governingTokenDepositAmount: Scalars['I64'];
  governingTokenMint: Scalars['PublicKey'];
  governingTokenOwner: Scalars['PublicKey'];
  outstandingProposalCount: Scalars['Int'];
  realm?: Maybe<Realm>;
  totalVotesCount: Scalars['I64'];
  unrelinquishedVotesCount: Scalars['I64'];
};

export type TwitterProfile = {
  __typename?: 'TwitterProfile';
  bannerImageUrl: Scalars['String'];
  description: Scalars['String'];
  handle: Scalars['String'];
  /** @deprecated Use profileImageUrlLowres instead. */
  profileImageUrl: Scalars['String'];
  profileImageUrlHighres: Scalars['String'];
  profileImageUrlLowres: Scalars['String'];
  walletAddress?: Maybe<Scalars['String']>;
};

export type Viewer = {
  __typename?: 'Viewer';
  address?: Maybe<Scalars['ID']>;
  balance?: Maybe<Scalars['Int']>;
  solBalance?: Maybe<Scalars['Int']>;
};

export enum Vote {
  Abstain = 'ABSTAIN',
  Approve = 'APPROVE',
  Deny = 'DENY',
  Veto = 'VETO'
}

export type VoteChoice = {
  __typename?: 'VoteChoice';
  address: Scalars['PublicKey'];
  rank: Scalars['Int'];
  weightPercentage: Scalars['Int'];
};

export type VoteRecord = VoteRecordV1 | VoteRecordV2;

export type VoteRecordV1 = {
  __typename?: 'VoteRecordV1';
  address: Scalars['PublicKey'];
  governingTokenOwner: Scalars['PublicKey'];
  isRelinquished: Scalars['Boolean'];
  proposal?: Maybe<ProposalV1>;
  tokenOwnerRecords: Array<TokenOwnerRecord>;
  voteType: VoteWeightV1;
  voteWeight: Scalars['I64'];
};

export type VoteRecordV2 = {
  __typename?: 'VoteRecordV2';
  address: Scalars['PublicKey'];
  approveVoteChoices: Array<VoteChoice>;
  governingTokenOwner: Scalars['PublicKey'];
  isRelinquished: Scalars['Boolean'];
  proposal?: Maybe<ProposalV2>;
  tokenOwnerRecords: Array<TokenOwnerRecord>;
  vote: Vote;
  voterWeight: Scalars['I64'];
};

export enum VoteThreshold {
  Quorum = 'QUORUM',
  YesVote = 'YES_VOTE'
}

export enum VoteTipping {
  Disabled = 'DISABLED',
  Early = 'EARLY',
  Strict = 'STRICT'
}

export enum VoteType {
  MultiChoice = 'MULTI_CHOICE',
  SingleChoice = 'SINGLE_CHOICE'
}

export enum VoteWeightV1 {
  No = 'NO',
  Yes = 'YES'
}

export type Wallet = {
  __typename?: 'Wallet';
  activities: Array<WalletActivity>;
  address: Scalars['PublicKey'];
  associatedTokenAccounts: Array<AssociatedTokenAccount>;
  bids: Array<Bid>;
  collectedCollections: Array<CollectedCollection>;
  compactCreatedCount?: Maybe<Scalars['String']>;
  compactFollowerCount?: Maybe<Scalars['String']>;
  compactFollowingCount?: Maybe<Scalars['String']>;
  compactOwnedCount?: Maybe<Scalars['String']>;
  connectionCounts: ConnectionCounts;
  displayName?: Maybe<Scalars['String']>;
  nftCounts: WalletNftCount;
  nfts: Array<Nft>;
  offers: Array<Offer>;
  portfolioValue?: Maybe<Scalars['Int']>;
  previewBanner?: Maybe<Scalars['String']>;
  previewImage?: Maybe<Scalars['String']>;
  profile?: Maybe<TwitterProfile>;
  shortAddress?: Maybe<Scalars['String']>;
  totalRewards: Scalars['U64'];
  twitterHandle?: Maybe<Scalars['String']>;
};


export type WalletActivitiesArgs = {
  eventTypes?: InputMaybe<Array<Scalars['String']>>;
  limit: Scalars['Int'];
  offset: Scalars['Int'];
};


export type WalletAssociatedTokenAccountsArgs = {
  mintAddress?: InputMaybe<Scalars['PublicKey']>;
};


export type WalletNftCountsArgs = {
  creators?: InputMaybe<Array<Scalars['PublicKey']>>;
};


export type WalletNftsArgs = {
  auctionHouse?: InputMaybe<Scalars['String']>;
  collections?: InputMaybe<Array<Scalars['String']>>;
  limit: Scalars['Int'];
  marketplaceProgram?: InputMaybe<Scalars['String']>;
  offset: Scalars['Int'];
  orderBy?: InputMaybe<OrderDirection>;
  sortBy?: InputMaybe<NftSort>;
};


export type WalletOffersArgs = {
  limit: Scalars['Int'];
  offerType?: InputMaybe<OfferType>;
  offset: Scalars['Int'];
};


export type WalletTotalRewardsArgs = {
  rewardCenter: Scalars['PublicKey'];
};

export type WalletActivity = {
  __typename?: 'WalletActivity';
  activityType: Scalars['String'];
  auctionHouse?: Maybe<AuctionHouse>;
  createdAt: Scalars['DateTimeUtc'];
  id: Scalars['Uuid'];
  marketplaceProgramAddress: Scalars['String'];
  metadata: Scalars['PublicKey'];
  nft?: Maybe<Nft>;
  nftMarketplace?: Maybe<NftMarketplace>;
  price: Scalars['U64'];
  primaryWallet: Wallet;
  solPrice?: Maybe<Scalars['Int']>;
  timeSince?: Maybe<Scalars['String']>;
  wallets: Array<Wallet>;
};

export type WalletNftCount = {
  __typename?: 'WalletNftCount';
  created: Scalars['Int'];
  listed: Scalars['Int'];
  offered: Scalars['Int'];
  owned: Scalars['Int'];
};


export type WalletNftCountListedArgs = {
  auctionHouses?: InputMaybe<Array<Scalars['PublicKey']>>;
};


export type WalletNftCountOfferedArgs = {
  auctionHouses?: InputMaybe<Array<Scalars['PublicKey']>>;
};
