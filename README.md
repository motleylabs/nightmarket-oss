# Night Market

A Solana NFT marketplace built by the people for the people using open source software by [Holaplex](https://holaplex.com/), [Metaplex](https://metaplex.com/) and [Motley Labs](https://motleylabs.com/).

## Contributing

We welcome contributions to Night Market from the community -- please open a pull request!

Feel free to join the [Motley DAO Discord](https://discord.gg/motleydao) to talk to the team and other community members.

All contributions are automatically licensed under the [GPL 3.0](/LICENSE).

## Overview

### Stack overview

This repository contains the Night Market frontend -- a web app built with Next.js, React and TailwindCSS. The `main` branch is what's deployed at [nightmarket.io](https://nightmarket.io/).

The frontend talks to [andromeda](https://github.com/motleylabs/andromeda), our web2 backend which talks to data providers, and [reward-center-program](https://github.com/motleylabs/reward-center-program), our marketplace on-chain program.

### Code overview

- `src/typings` - Types declarations.
- `public/*` - Static assets including fonts, images and locales.
- `src/components/*` - The different reusable components used throughout the app including Button, Icon, Avatar, Form, List, etc.
- `src/hooks/*` - Useful hooks used throughout the app.
- `src/layouts/*` - The different layouts used by pages.
- `src/modules/*` - Various helper methods and utilities worthy of converting to a helper library.
- `src/pages/*` - Contains all the app's pages.
- `src/providers/*` - Providers to provide context at various places.
- `src/app.config.ts` - Global config values used throughout the app like app's base url, api url, solana rpc url, market's auctionhouse address etc.
- `src/cache.ts` - Global reactive variables that can be set and read from anywhere in the application. Similar to redux state.
- `styles/globals.css` - A small amount of global styles since the app mostly make use of vanilla Tailwind CSS.
- `next-18next.config.js` - Supported languages and the default language.
- `next.config.js` - NextJS configuration containing route redirects and other NextJS extensions.

## Environment

The list of required environment variables for the application. To be set through the OS environment or through .env file.

| Name | Description |
|------|-------------|
| NEXT_PUBLIC_ADDRESS_LOOKUP_TABLE | The address of the reward center's address lookup table generated by `reward-center-cli` and used for the buy_listing and accept_offer actions. |
| NEXT_PUBLIC_ANDROMEDA_ENDPOINT | The URL of the [andromeda](https://github.com/motleylabs/andromeda) deployment. Use `https://api.nightmarket.io/api` for the production Night Market deployment. |
| NEXT_PUBLIC_AUCTION_HOUSE_ADDRESS | The address of the auction house for the reward center, generated by `reward-center-cli`. |
| NEXT_PUBLIC_AUCTION_HOUSE_PROGRAM_ADDRESS | Should be set to `rwdD3F6CgoCAoVaxcitXAeWRjQdiGc5AVABKCpQSMfd`. A deployment of the [reward-center-program](https://github.com/motleylabs/reward-center-program). |
| NEXT_PUBLIC_BASE_URL | The URL of the [andromeda](https://github.com/motleylabs/andromeda) deployment. Use `https://api.nightmarket.io` for the production Night Market deployment. |
| NEXT_PUBLIC_BLOCK_REFERRALS | `true` or `false`. Whether to use the [BuddyLink](https://www.npmjs.com/package/@ladderlabs/buddylink) integration. |
| NEXT_PUBLIC_ORGANIZATION_NAME | The [BuddyLink](https://www.npmjs.com/package/@ladderlabs/buddylink) organization. |
| NEXT_PUBLIC_REFERRAL_KEY | An API key for the [BuddyLink](https://www.npmjs.com/package/@ladderlabs/buddylink) tracking endpoint. |
| NEXT_PUBLIC_REFERRAL_URL | `https://market-api.getdolphin.io/apiv3/`
| NEXT_PUBLIC_SOLANA_RPC_URL | A Solana RPC endpoint. E.g. `https://api.mainnet-beta.solana.com/` |

## Getting Started

First, install dependencies

```bash
yarn install
```

Then, run the development server:

```bash
yarn dev
```

You might also want to setup a .env.local file to override some ENV variables like RPC provider, don't forget to restart the server if you do.

```bash
NEXT_PUBLIC_SOLANA_RPC_URL="https://rpc.helius.xyz/[...api_key]"
```

## Deploy

```bash
yarn build
yarn start
```
