/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: [
    'NEXT_PUBLIC_GRAPHQL_URL'
  ],
  i18n: {
    locales: ['en'],
    defaultLocale: 'en'
  }
}
const withGraphql = require('next-plugin-graphql')

module.exports = withGraphql(nextConfig)
