import { ApolloClient, gql, InMemoryCache } from '@apollo/client';
import { offsetLimitPagination } from '@apollo/client/utilities';
import BN from 'bn.js';
import { viewerVar } from './cache';
import config from './app.config';
import { isPublicKey, shortenAddress, addressAvatar } from './modules/address';
import { toSol } from './modules/sol';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ConnectionCounts, WalletNftCount, TwitterProfile } from './types';
import { ReadFieldFunction } from '@apollo/client/cache/core/types/common';

function asBN(value: string | null): BN {
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

function asCompactNumber(number: number): string {
  return new Intl.NumberFormat('en-GB', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(number);
}

const typeDefs = gql`
  type Viewer {
    id: ID
    balance: Number
  }

  extend type Marketplace {
    fee: number
  }

  extend type Nft {
    shortAddress: String
    shortMintAddress: String
    royalties: number
  }

  extend type Collection {
    totalVolume: String
    listedCount: Number
    holderCount: Number
  }

  extend type NftActivity {
    solPrice: Number
  }

  extend type Wallet {
    displayName: string
    previewImage: string
    previewBanner: string
    shortAddress: string
    compactFollowingCount: string
    compactFollowerCount: string
    compactOwnedCount: string
    compactCreatedCount: string
    portfolioValue: number
  }

  extend type MetadataJson {
    creatorDisplayName: string
  }

  extend type Query {
    viewer(address: String!): Viewer
  }
`;

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
          nfts: offsetLimitPagination(['$listed', '$collection', '$owner', '$creator']),
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
            read(value): string {
              const lamports = asBN(value);

              return (lamports.toNumber() / LAMPORTS_PER_SOL).toFixed(1);
            },
          },
          activities: offsetLimitPagination(['$eventTypes']),
          nftCount: {
            read: asCompactNumber,
          },
          totalVolume: {
            read(_) {
              return asCompactNumber(1800000);
            },
          },
          listedCount: {
            read(_) {
              return asCompactNumber(1400);
            },
          },
          holderCount: {
            read(_) {
              return asCompactNumber(6250);
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
        },
      },
      AhListing: {
        keyFields: ['id'],
        fields: {
          price: {
            read: asBN,
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
        },
      },
      Offer: {
        keyFields: ['id'],
        fields: {
          price: {
            read: asBN,
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
