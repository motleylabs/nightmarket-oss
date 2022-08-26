# DAO Marketplace

A Solana NFT marketplace built by the people for the people using opensource software by [Holaplex](https://holaplex.com/) and [Metaplex](https://metaplex.com/).

## Getting Started

First, install dependencies

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

You might also want to setup a .env.local file to override some ENV variables like RPC provider, don't forget to restart the server if you do.

```bash
NEXT_PUBLIC_SOLANA_RPC_URL="https://holaplex-main-9e4a.mainnet.rpcpool.com/[...api_key]"
```

It is requires to run `npm run codegen` after the following activities:

- Updating the Holaplex NFT API
- Adjusting the [`local.graphql`](https://github.com/holaplex/dao-marketplace/blob/main/local.graphql)
- Adding or updating graphql queries in [`src/queries`](https://github.com/holaplex/dao-marketplace/blob/main/src/queries) directory

The codegen command will autogenerate type definitions for the application's queries and the API server graphql objects.

## Deploy

```bash
npm run build
npm run start
```
