import { ApolloClient, InMemoryCache } from '@apollo/client';
import { offsetLimitPagination } from '@apollo/client/utilities';
import BN from 'bn.js';
import { viewerVar } from './cache';
import config from './app.config';
import { isPublicKey, shortenAddress, addressAvatar } from './modules/address';
import { toSol } from './modules/sol';
import typeDefs from './../local.graphql';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  ConnectionCounts,
  WalletNftCount,
  TwitterProfile,
  NftMarketplace,
  AuctionHouse,
  Wallet,
  AhListing,
} from './graphql.types';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ReadFieldFunction } from '@apollo/client/cache/core/types/common';
import marketplaces from './marketplaces.json';
import { asCompactNumber } from './modules/number';
import { ActivityType } from './components/Activity';

function asBN(value: string | number | null): BN {
  if (value === null) {
    return new BN(0);
  }
  return new BN(value);
}

function asSOL(_: any, { readField }: { readField: ReadFieldFunction }): number {
  const price: BN | undefined = readField('price');

  if (!price) {
    return 0;
  }

  return toSol(price.toNumber());
}

function asDisplayName(_: any, { readField }: { readField: ReadFieldFunction }): string {
  const profile: TwitterProfile | undefined = readField('profile');
  const address: string | undefined = readField('address');

  if (profile) {
    return `@${profile.handle}`;
  }

  return shortenAddress(address);
}

function asTimeSince(_: any, { readField }: { readField: ReadFieldFunction }): string | undefined {
  const createdAt: string | undefined = readField('createdAt');

  if (!createdAt) {
    return undefined;
  }

  return formatDistanceToNow(parseISO(createdAt), { addSuffix: true });
}

function asPreviewImage(_: any, { readField }: { readField: ReadFieldFunction }): string {
  const profile: TwitterProfile | undefined = readField('profile');
  const address: string | undefined = readField('address');

  if (profile) {
    return profile.profileImageUrlHighres as string;
  }

  return addressAvatar(address);
}

function asPreviewBanner(_: any, { readField }: { readField: ReadFieldFunction }): string {
  const profile: TwitterProfile | undefined = readField('profile');
  const address: string | undefined = readField('address');

  if (profile) {
    return profile.bannerImageUrl as string;
  }

  return addressAvatar(address);
}

function asShortAddress(_: any, { readField }: { readField: ReadFieldFunction }): string {
  const address: string | undefined = readField('address');

  return shortenAddress(address);
}

function asShortMintAddress(_: any, { readField }: { readField: ReadFieldFunction }): string {
  const address: string | undefined = readField('mintAddress');

  return shortenAddress(address);
}

function asNFTImage(image: string, { readField }: { readField: ReadFieldFunction }): string {
  const address: string | undefined = readField('mintAddress');

  if (image === '') {
    return addressAvatar(address);
  }

  return image;
}

function asActivityPrimaryWallet(
  _: void,
  { readField }: { readField: ReadFieldFunction }
): Wallet | undefined {
  const type: string | undefined = readField('activityType');
  const wallets: readonly [Wallet, Wallet] | undefined = readField('wallets');

  if (!type || !wallets) {
    return undefined;
  }

  switch (type) {
    case ActivityType.Purchase || ActivityType.Sell:
      return wallets[1];
    case ActivityType.Listing:
      return wallets[0];
    case ActivityType.Offer:
      return wallets[0];
  }
}

function asNftMarketplace(
  _: void,
  { readField }: { readField: ReadFieldFunction }
): NftMarketplace {
  const marketplaceProgramAddress: string | undefined = readField('marketplaceProgramAddress');
  const auctionHouse: AuctionHouse | undefined = readField('auctionHouse');

  let result: NftMarketplace[] | NftMarketplace | undefined;

  const unknownMarketplace = {
    logo: '/images/unknown-marketplace.svg',
    name: 'Unknown Marketplace',
    link: undefined,
  };

  result = marketplaces.filter(
    (marketplace) => marketplace.marketplaceProgramAddress === marketplaceProgramAddress
  );

  if (result.length === 0) {
    return unknownMarketplace;
  } else if (result.length === 1) {
    return result[0];
  }

  result = result.find((marketplace) => marketplace.auctionHouseAddress === auctionHouse?.address);

  if (!result) {
    return unknownMarketplace;
  }

  return result;
}

const client = new ApolloClient({
  uri: config.graphqlUrl,
  typeDefs,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          wallet: {
            merge(_, incoming, { readField }) {
              const address: string | undefined = readField('address', incoming);

              if (isPublicKey(address)) {
                return incoming;
              }

              return null;
            },
          },
          nfts: offsetLimitPagination([
            '$listed',
            '$collection',
            '$owner',
            '$creator',
            '$collections',
            '$attributes',
          ]),
          collectionsFeaturedByVolume: offsetLimitPagination(),
          collectionsFeaturedByMarketCap: offsetLimitPagination(),
          collectionTrends: offsetLimitPagination(['$sortBy', '$timeFrame', '$orderDirection']),
          viewer: {
            read() {
              return viewerVar();
            },
          },
        },
      },
      Wallet: {
        keyFields: ['address'],
        fields: {
          activities: offsetLimitPagination(['$eventTypes']),
          offers: offsetLimitPagination(['$offerType']),
          nfts: offsetLimitPagination(['$marketplaceProgram', '$auctionHouse', '$collections']),
          displayName: {
            read: asDisplayName,
          },
          previewImage: {
            read: asPreviewImage,
          },
          previewBanner: {
            read: asPreviewBanner,
          },
          shortAddress: {
            read: asShortAddress,
          },
          compactFollowingCount: {
            read(_, { readField }) {
              const connectionCounts: ConnectionCounts | undefined = readField('connectionCounts');

              if (!connectionCounts) {
                return asCompactNumber(0);
              }

              const { fromCount } = connectionCounts;

              return asCompactNumber(fromCount);
            },
          },
          compactFollowerCount: {
            read(_, { readField }) {
              const connectionCounts: ConnectionCounts | undefined = readField('connectionCounts');

              if (!connectionCounts) {
                return asCompactNumber(0);
              }

              const { toCount } = connectionCounts;

              return asCompactNumber(toCount);
            },
          },
          compactOwnedCount: {
            read(_, { readField }) {
              const nftCounts: WalletNftCount | undefined = readField('nftCounts');

              if (!nftCounts) {
                return asCompactNumber(0);
              }

              const { owned } = nftCounts;

              return asCompactNumber(owned);
            },
          },
          compactCreatedCount: {
            read(_, { readField }) {
              const nftCounts: WalletNftCount | undefined = readField('nftCounts');

              if (!nftCounts) {
                return asCompactNumber(0);
              }

              const { created } = nftCounts;

              return asCompactNumber(created);
            },
          },
        },
      },
      WalletActivity: {
        keyFields: ['id'],
        fields: {
          nftMarketplace: {
            read: asNftMarketplace,
          },
          price: {
            read: asBN,
          },
          solPrice: {
            read: asSOL,
          },
          timeSince: {
            read: asTimeSince,
          },
          primaryWallet: {
            read: asActivityPrimaryWallet,
          },
        },
      },
      NftCreator: {
        keyFields: ['address'],
        fields: {
          displayName: {
            read: asDisplayName,
          },
          previewImage: {
            read: asPreviewImage,
          },
          shortAddress: {
            read: asShortAddress,
          },
          previewBanner: {
            read: asPreviewBanner,
          },
        },
      },
      CollectionTrend: {
        fields: {
          compactNftCount: {
            read(_, { readField }): string {
              const nftCount: string | undefined = readField('nftCount');
              if (!nftCount) {
                return '0';
              }

              return asCompactNumber(parseInt(nftCount));
            },
          },
          compactOneDayVolume: {
            read(_, { readField }): string {
              const oneDayVolume: string | undefined = readField('oneDayVolume');
              if (!oneDayVolume) {
                return '0';
              }

              return asCompactNumber(toSol(parseInt(oneDayVolume)));
            },
          },
          compactOneDaySalesCount: {
            read(_, { readField }): string {
              const oneDaySalesCount: number | undefined = readField('oneDaySalesCount');
              if (!oneDaySalesCount) {
                return '0';
              }

              return asCompactNumber(oneDaySalesCount);
            },
          },
          compactSevenDayVolume: {
            read(_, { readField }): string {
              const sevenDayVolume: string | undefined = readField('sevenDayVolume');
              if (!sevenDayVolume) {
                return '0';
              }

              return asCompactNumber(toSol(parseInt(sevenDayVolume)));
            },
          },
          compactSevenDaySalesCount: {
            read(_, { readField }): string {
              const sevenDaySalesCount: number | undefined = readField('sevenDaySalesCount');
              if (!sevenDaySalesCount) {
                return '0';
              }

              return asCompactNumber(sevenDaySalesCount);
            },
          },
          compactThirtyDayVolume: {
            read(_, { readField }): string {
              const thirtyDayVolume: string | undefined = readField('thirtyDayVolume');
              if (!thirtyDayVolume) {
                return '0';
              }

              return asCompactNumber(toSol(parseInt(thirtyDayVolume)));
            },
          },
          compactThirtyDaySalesCount: {
            read(_, { readField }): string {
              const thirtyDaySalesCount: number | undefined = readField('thirtyDaySalesCount');
              if (!thirtyDaySalesCount) {
                return '0';
              }

              return asCompactNumber(thirtyDaySalesCount);
            },
          },
          compactFloorPrice: {
            read(_, { readField }): string {
              const floorPrice: string | undefined = readField('floorPrice');
              if (!floorPrice) {
                return '0';
              }

              return asCompactNumber(toSol(parseInt(floorPrice)));
            },
          },
        },
      },
      Collection: {
        fields: {
          floorPrice: {
            read(value): number {
              return toSol(value, 3);
            },
          },
          activities: offsetLimitPagination(['$eventTypes']),
          nfts: offsetLimitPagination(['$order', '$sortBy', '$attributes']),
          compactNftCount: {
            read(_, { readField }): string {
              const nftCount: string | undefined = readField('nftCount');
              if (!nftCount) {
                return '0';
              }

              return asCompactNumber(parseInt(nftCount));
            },
          },
          volumeTotal: {
            read(value): number {
              return toSol(value, 3);
            },
          },
          compactFloorPrice: {
            read(_, { readField }): string {
              const floorPrice: number | undefined = readField('floorPrice');

              if (!floorPrice) {
                return '0';
              }

              return asCompactNumber(floorPrice);
            },
          },
          compactVolumeTotal: {
            read(_, { readField }): string {
              const volumeTotal: number | undefined = readField('volumeTotal');

              if (!volumeTotal) {
                return '0';
              }

              return asCompactNumber(volumeTotal);
            },
          },
          listedCount: {
            read: asCompactNumber,
          },
        },
      },
      CollectedCollection: {
        fields: {
          estimatedValue: {
            read(value) {
              const lamports = asBN(value);

              return (lamports.toNumber() / LAMPORTS_PER_SOL).toFixed(1);
            },
          },
        },
      },
      MintStats: {
        fields: {
          volume24hr: {
            read: asBN,
          },
          volumeTotal: {
            read: asBN,
          },
          average: {
            read: asBN,
          },
          floor: {
            read: asBN,
          },
        },
      },
      PricePoint: {
        fields: {
          price: {
            read: asBN,
          },
        },
      },
      StoreCreator: {
        keyFields: ['creatorAddress', 'storeConfigAddress'],
      },
      Marketplace: {
        keyFields: ['configAddress'],
      },
      MetadataJson: {
        keyFields: ['address'],
        fields: {
          image: {
            read: asNFTImage,
          },
          creatorDisplayName: {
            read(_, { readField }): string | null {
              const handle: string | undefined = readField('creatorTwitterHandle');
              const address: string | undefined = readField('creatorAddress');

              if (handle) {
                return `@${handle}`;
              }

              if (address) {
                return shortenAddress(address);
              }

              return null;
            },
          },
        },
      },
      Nft: {
        keyFields: ['mintAddress'],
        fields: {
          shortMintAddress: {
            read: asShortMintAddress,
          },
          shortAddress: {
            read: asShortAddress,
          },
          image: {
            read: asNFTImage,
          },
          royalties: {
            read(_, { readField }): number {
              const sellerFeeBasisPoints: number | undefined = readField('sellerFeeBasisPoints');

              if (!sellerFeeBasisPoints) {
                return 0;
              }

              return sellerFeeBasisPoints / 100;
            },
          },
          listing: {
            read(_, { readField }): AhListing | undefined {
              const listings: readonly AhListing[] | undefined = readField('listings');
              return listings?.find(
                (listing) => listing.auctionHouse?.address === config.auctionHouseAddress
              );
            },
          },
          isListedOnME: {
            read(_, { readField }): boolean {
              const listings: readonly AhListing[] | undefined = readField('listings');
              const magicEdenListings = listings?.filter(
                (listing) =>
                  listing.auctionHouse?.address === 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K'
              );

              return !!magicEdenListings?.length;
            },
          },
          magicEdenListings: {
            read(_, { readField }): any[] {
              const listings: readonly AhListing[] | undefined = readField('listings');
              console.log('meListings', listings);
              const magicEdenListings = listings?.filter(
                (listing) =>
                  listing.auctionHouse?.address === 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K'
              );

              return magicEdenListings || [];
            },
          },
          marketplaceListings: {
            read(_, { readField }): any[] {
              const nftName = readField('name');
              const listings: readonly AhListing[] | undefined = readField('listings');
              console.log('daomarketlistings', nftName, listings);
              const daomarketListings = listings?.filter(
                (listing) => listing.auctionHouse?.address === config.auctionHouseAddress
              );

              return daomarketListings || [];
            },
          },
        },
      },
      Creator: {
        keyFields: ['address'],
      },
      NftOwner: {
        keyFields: ['address'],
        fields: {
          displayName: {
            read: asDisplayName,
          },
          previewImage: {
            read: asPreviewImage,
          },
          shortAddress: {
            read: asShortAddress,
          },
          previewBanner: {
            read: asPreviewBanner,
          },
        },
      },
      Purchase: {
        keyFields: ['id'],
        fields: {
          price: {
            read: asBN,
          },
          previewPrice: {
            read: asSOL,
          },
        },
      },
      AhListing: {
        keyFields: ['id'],
        fields: {
          price: {
            read: asBN,
          },
          previewPrice: {
            read: asSOL,
          },
          nftMarketplace: {
            read: asNftMarketplace,
          },
          solPrice: {
            read: asSOL,
          },
        },
      },
      NftActivity: {
        keyFields: ['id'],
        fields: {
          nftMarketplace: {
            read: asNftMarketplace,
          },
          price: {
            read: asBN,
          },
          solPrice: {
            read: asSOL,
          },
          timeSince: {
            read: asTimeSince,
          },
          primaryWallet: {
            read: asActivityPrimaryWallet,
          },
        },
      },
      Offer: {
        keyFields: ['id'],
        fields: {
          nftMarketplace: {
            read: asNftMarketplace,
          },
          price: {
            read: asBN,
          },
          timeSince: {
            read: asTimeSince,
          },
          solPrice: {
            read: asSOL,
          },
        },
      },
      AuctionHouse: {
        keyFields: ['address'],
        fields: {
          fee: {
            read(_, { readField }): number {
              const sellerFeeBasisPoints: number | undefined = readField('sellerFeeBasisPoints');

              if (!sellerFeeBasisPoints) {
                return 0;
              }

              return sellerFeeBasisPoints / 100;
            },
          },
        },
      },
      NftAttribute: {
        keyFields: ['traitType', 'value'],
      },
    },
  }),
});

export default client;
