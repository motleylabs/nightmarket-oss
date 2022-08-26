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
} from './graphql.types';
import { ReadFieldFunction } from '@apollo/client/cache/core/types/common';
import marketplaces from './marketplaces.json';
import { asCompactNumber } from './modules/number';

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
          ]),
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
          portfolioValue: {
            read() {
              return 100.25;
            },
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
          nftMarketplace: {
            read: asNftMarketplace,
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
      Collection: {
        fields: {
          floorPrice: {
            read(value): number {
              return toSol(value, 3);
            },
          },
          activities: offsetLimitPagination(['$eventTypes']),
          compactNftCount: {
            read(_, { readField }): string {
              const nftCount: number | undefined = readField('nftCount');

              if (!nftCount) {
                return '0';
              }

              return asCompactNumber(nftCount);
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
          holderCount: {
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
        },
      },
      AhListing: {
        keyFields: ['id'],
        fields: {
          price: {
            read: asBN,
          },
          nftMarketplace: {
            read: asNftMarketplace,
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
