import { ApolloClient, gql, InMemoryCache } from '@apollo/client';
import { offsetLimitPagination } from '@apollo/client/utilities';
import BN from 'bn.js';
import { viewerVar } from './cache';
import config from './app.config';
import { isPublicKey, shortenAddress, addressAvatar } from './modules/address';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TwitterProfile } from './types';
import { ReadFieldFunction } from '@apollo/client/cache/core/types/common';

function asBN(value: string): BN {
  try {
    return new BN(value);
  } catch {
    return new BN(0);
  }
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

function asShortAddress(_: any, { readField }: { readField: ReadFieldFunction }): string {
  const address: string | undefined = readField('address');

  return shortenAddress(address);
}

function asNFTImage(image: string, { readField }: { readField: ReadFieldFunction }): string {
  const address: string | undefined = readField('mintAddress');

  if (image === '') {
    return addressAvatar(address);
  }

  return image;
}

const typeDefs = gql`
  type Viewer {
    id: ID
    balance: Number
  }

  extend type Collection {
    totalVolume: String
    listedCount: Number
    holderCount: Number
  }

  extend type Wallet {
    displayName: string
    previewImage: string
    shortAddress: string
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
          nfts: offsetLimitPagination(),
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
          shortAddress: {
            read: asShortAddress,
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
        },
      },
      Collection: {
        fields: {
          floorPrice: {
            read(value) {
              const lamports = asBN(value);

              return (lamports.toNumber() / LAMPORTS_PER_SOL).toFixed(1);
            },
          },
          nftCount: {
            read(value) {
              return new Intl.NumberFormat('en-GB', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(value);
            },
          },
          totalVolume: {
            read(_) {
              return new Intl.NumberFormat('en-GB', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(1800000);
            },
          },
          listedCount: {
            read(_) {
              return new Intl.NumberFormat('en-GB', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(1400);
            },
          },
          holderCount: {
            read(_) {
              return new Intl.NumberFormat('en-GB', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(6250);
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
        keyFields: ['ownerAddress'],
      },
      MetadataJson: {
        keyFields: ['address'],
        fields: {
          image: {
            read: asNFTImage,
          },
          creatorDisplayName: {
            read(_, { readField }) {
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
        keyFields: ['address'],
        fields: {
          image: {
            read: asNFTImage,
          },
        },
      },
      Creator: {
        keyFields: ['address'],
      },
      NftOwner: {
        keyFields: ['address'],
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
      NftAttribute: {
        keyFields: ['traitType', 'value'],
      },
    },
  }),
});

export default client;
