const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['127.0.0.1:3000', 'localhost:3000'],
    },
  },
}

module.exports = withNextIntl(nextConfig)
