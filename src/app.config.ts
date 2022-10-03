interface AppConfig {
  baseUrl: string;
  graphqlUrl: string;
  solanaRPCUrl: string;
  marketplaceSubdomain: string;
  rewardCenter: {
    address: string;
    ata: string;
    token: string;
  };
  socialMedia: {
    twitter?: string;
    discord?: string;
    medium?: string;
  };
  website: string;
  auctionHouseAddress: string;
}

const config: AppConfig = {
  baseUrl: 'https://nightmarket.io', // could also be an ENV variable
  graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL as string,
  solanaRPCUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL as string,
  marketplaceSubdomain: process.env.NEXT_PUBLIC_MARKETPLACE_SUBDOMAIN as string,
  rewardCenter: {
    address: process.env.NEXT_PUBLIC_REWARD_CENTER_ADDRESS as string,
    ata: process.env.NEXT_PUBLIC_REWARD_CENTER_ATA as string,
    token: process.env.NEXT_PUBLIC_REWARD_CENTER_TOKEN_MINT as string,
  },
  socialMedia: {
    twitter: 'https://twitter.com/nightmarketio',
    discord: 'https://discord.gg/bn5z4A794E',
    medium: 'https://medium.com/@MotleyLabs',
  },
  website: 'https://motleylabs.com',
  auctionHouseAddress: process.env.NEXT_PUBLIC_AUCTION_HOUSE_ADDRESS as string,
};

export default config;
