# Rewards center marketplace

A Solana NFT marketplace built by the people for the people using opensource software by [Holaplex](https://holaplex.com/) and [Metaplex](https://metaplex.com/).

## Overview

- `@types/*` - Auto-generated graphql typescript declarations.
- `public/*` - Static assets including fonts, images and locales.
- `src/components/*` - The different reusable components used throughout the app including Button, Icon, Avatar, Form, List, NftCard etc.
- `src/hooks/*` - Useful hooks used throught the app.
- `src/layouts/*` - The different layouts used by pages.
- `src/modules/*` - Various helper methods and utilities worthy of converting to a helper library.
- `src/pages/*` - Contains all the app's pages.
- `src/providers/*` - Providers to provide context at various places.
- `src/queries/*` - All the graphql queries segregated by pages or components.
- `src/queries/fragments/*` - Reusable graphql query fragments.
- `src/app.config.ts` - Global config values used throughout the app like app's base url, graphql url, solana rpc url, market's auctionhouse address etc.
- `src/cache.ts` - Contains cache data used by graphql client.
- `src/client.ts` - Apollo Graphql Client
- `src/graphql.types.ts` - Auto-generated graphql types.
- `styles/globals.css` - A small amount of global styles since the app mostly make use of vanilla Tailwind CSS.
- `local.graphql` - Type extensions for graphql types.

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
