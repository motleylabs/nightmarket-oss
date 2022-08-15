/**
 * @type {import('next').NextConfig}
 */

const { i18n } = require('./next-i18next.config');
const withGraphql = require('next-plugin-graphql');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // env: {
  //   gql: 'NEXT_PUBLIC_GRAPHQL_URL',
  //   rpc: 'NEXT_PUBLIC_SOLANA_RPC_URL',
  // },
  i18n,
};

module.exports = withGraphql(nextConfig);
