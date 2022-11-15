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
  CollectionTrend,
  Maybe,
  Offer,
  Nft,
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

function asShortVerifiedCollectionAddress(
  _: any,
  { readField }: { readField: ReadFieldFunction }
): string {
  const address: string | undefined = readField('verifiedCollectionAddress');

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

function nftMarketplace(item: {
  marketplaceProgramAddress: string | null;
  auctionHouse: AuctionHouse | null;
}): NftMarketplace {
  const marketplaceProgramAddress = item.marketplaceProgramAddress;
  const auctionHouse = item.auctionHouse;

  let result: NftMarketplace[] | NftMarketplace | undefined;

  const unknownMarketplace = {
    logo: '/images/unknown-marketplace.svg',
    name: 'Unknown Marketplace',
    link: null,
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
            keyArgs: ['address'],
            merge(_, incoming, { readField }) {
              const address: string | undefined = readField('address', incoming);

              if (isPublicKey(address)) {
                return incoming;
              }

              return null;
            },
          },
          collectionTrends: offsetLimitPagination(['sortBy', 'timeFrame', 'orderDirection']),
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
          activities: offsetLimitPagination(),
          offers: offsetLimitPagination(),
          nfts: offsetLimitPagination(),
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
          compactVolume1d: {
            read(_, { readField }): string {
              const volume1d: string | undefined = readField('volume1d');
              if (!volume1d) {
                return '0';
              }

              return asCompactNumber(toSol(parseInt(volume1d)));
            },
          },
          compactListed1d: {
            read(_, { readField }): string {
              const listed1d: number | undefined = readField('listed1d');
              if (!listed1d) {
                return '0';
              }

              return asCompactNumber(listed1d);
            },
          },
          compactVolume7d: {
            read(_, { readField }): string {
              const volume7d: string | undefined = readField('volume7d');
              if (!volume7d) {
                return '0';
              }

              return asCompactNumber(toSol(parseInt(volume7d)));
            },
          },
          compactListed7d: {
            read(_, { readField }): string {
              const listed7d: number | undefined = readField('listed7d');
              if (!listed7d) {
                return '0';
              }

              return asCompactNumber(listed7d);
            },
          },
          compactVolume30d: {
            read(_, { readField }): string {
              const volume30d: string | undefined = readField('volume30d');
              if (!volume30d) {
                return '0';
              }

              return asCompactNumber(toSol(parseInt(volume30d)));
            },
          },
          compactListed30d: {
            read(_, { readField }): string {
              const listed30d: number | undefined = readField('listed30d');
              if (!listed30d) {
                return '0';
              }

              return asCompactNumber(listed30d);
            },
          },
          compactFloor1d: {
            read(_, { readField }): string {
              const floorPrice: string | undefined = readField('floor1d');
              if (!floorPrice) {
                return '0';
              }

              return asCompactNumber(toSol(parseInt(floorPrice)));
            },
          },
          compactFloor7d: {
            read(_, { readField }): string {
              const floorPrice: string | undefined = readField('floor7d');
              if (!floorPrice) {
                return '0';
              }

              return asCompactNumber(toSol(parseInt(floorPrice)));
            },
          },
          compactFloor30d: {
            read(_, { readField }): string {
              const floorPrice: string | undefined = readField('floor30d');
              if (!floorPrice) {
                return '0';
              }

              return asCompactNumber(toSol(parseInt(floorPrice)));
            },
          },
        },
      },
      Collection: {
        keyFields: ['id'],
        fields: {
          activities: offsetLimitPagination(),
          nfts: offsetLimitPagination(),
          holderCount: {
            read(value): string {
              if (!value) {
                return '0';
              }

              return asCompactNumber(parseInt(value));
            },
          },
          shortVerifiedCollectionAddress: {
            read: asShortVerifiedCollectionAddress,
          },
          marketCap: {
            read(_, { readField }): string {
              const trends: CollectionTrend | undefined = readField('trends');
              const pieces: number | undefined = readField('pieces');

              if (!pieces || !trends) {
                return '0';
              }

              const marketCap = pieces * toSol(parseInt(trends?.floor1d));

              return asCompactNumber(marketCap);
            },
          },
          compactPieces: {
            read(_, { readField }): string {
              const nftCount: number | undefined = readField('pieces');

              if (!nftCount) {
                return '0';
              }

              return asCompactNumber(nftCount);
            },
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
          solPrice: {
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
          solPrice: {
            read: asSOL,
          },
        },
      },
      NftActivity: {
        keyFields: ['id'],
        fields: {
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
  resolvers: {
    AhListing: {
      nftMarketplace,
      solPrice(listing: AhListing) {
        return toSol(parseInt(listing.price));
      },
    },
    NftActivity: {
      nftMarketplace,
    },
    WalletActivity: {
      nftMarketplace,
    },
    Wallet: {
      previewImage(wallet: Wallet) {
        const { profile, address } = wallet;

        if (profile) {
          return profile.profileImageUrlHighres as string;
        }

        return addressAvatar(address);
      },
      displayName(wallet: Wallet) {
        const { profile, address } = wallet;

        if (profile) {
          return `@${profile.handle}`;
        }

        return shortenAddress(address);
      },
    },
    Offer: {
      nftMarketplace,
      solPrice(listing: AhListing) {
        return toSol(parseInt(listing.price));
      },
    },
  },
});

export default client;
