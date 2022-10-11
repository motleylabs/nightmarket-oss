interface AppConfig {
  baseUrl: string;
  graphqlUrl: string;
  solanaRPCUrl: string;
  socialMedia: {
    twitter?: string;
    discord?: string;
    medium?: string;
  };
  website: string;
  auctionHouse: string;
}

const config: AppConfig = {
  baseUrl: 'https://nightmarket.io', // could also be an ENV variable
  graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL as string,
  solanaRPCUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL as string,
  socialMedia: {
    twitter: 'https://twitter.com/nightmarketio',
    discord: 'https://discord.gg/bn5z4A794E',
    medium: 'https://medium.com/@MotleyLabs',
  },
  website: 'https://motleylabs.com',
  auctionHouse: process.env.NEXT_PUBLIC_AUCTION_HOUSE_ADDRESS as string,
};

export default config;
