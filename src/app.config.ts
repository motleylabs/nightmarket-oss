interface AppConfig {
  graphqlUrl: string;
  solanaRPCUrl: string;
}

const config: AppConfig = {
  graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL as string,
  solanaRPCUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL as string,
};

export default config;
