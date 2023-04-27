export interface AppConfig {
  baseUrl: string;
  solanaRPCUrl: string;
  referralUrl: string;
  referralKey: string;
  referralOrg: string;
  socialMedia: {
    twitter?: string;
    discord?: string;
    medium?: string;
  };
  offerMinimums: {
    percentageFloor: number;
    percentageListing: number;
  };
  buddylink: {
    buddyBPS: number;
  };
  website: string;
  status: string;
  tos: string;
  privacyPolicy: string;
  auctionHouse: string;
  auctionHouseProgram?: string;
  addressLookupTable: string;
}

const config: AppConfig = {
  baseUrl: 'https://nightmarket.io', // could also be an ENV variable
  solanaRPCUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL as string,
  referralUrl: process.env.NEXT_PUBLIC_REFERRAL_URL as string,
  referralKey: process.env.NEXT_PUBLIC_REFERRAL_KEY as string,
  referralOrg: process.env.NEXT_PUBLIC_ORGANIZATION_NAME as string,
  socialMedia: {
    twitter: 'https://twitter.com/nightmarketio',
    discord: 'https://discord.gg/bn5z4A794E',
    medium: 'https://medium.com/@Motleydao',
  },
  website: 'https://motleydao.com',
  status: 'https://motleylabs.cronitorstatus.com',
  tos: '',
  privacyPolicy: '',
  auctionHouse: process.env.NEXT_PUBLIC_AUCTION_HOUSE_ADDRESS as string,
  auctionHouseProgram: process.env.NEXT_PUBLIC_AUCTION_HOUSE_PROGRAM_ADDRESS,
  offerMinimums: {
    percentageFloor: 0.8,
    percentageListing: 0.8,
  },
  buddylink: {
    buddyBPS: 0,
  },
  addressLookupTable: process.env.NEXT_PUBLIC_ADDRESS_LOOKUP_TABLE as string,
};

export default config;
