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
        source: '/collections/:id/nfts',
        destination: '/collections/:id',
        permanent: true,
      },
      {
        source: '/profiles/:address/collected',
        destination: '/profiles/:address',
        permanent: true,
      },
      {
        source: '/nfts/:address/details',
        destination: '/nfts/:address',
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
