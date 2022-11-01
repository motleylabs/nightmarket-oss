/**
 * @type {import('next').NextConfig}
 */

const { i18n } = require('./next-i18next.config');
const withGraphql = require('next-plugin-graphql');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  i18n,
  async redirects() {
    return [
      {
        source: '/collections/:id',
        destination: '/collections/:id/nfts',
        permanent: true,
      },
      {
        source: '/profiles/:address',
        destination: '/profiles/:address/collected',
        permanent: true,
      },
      {
        source: '/nfts/:address',
        destination: '/nfts/:address/details',
        permanent: true,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = withGraphql(nextConfig);
