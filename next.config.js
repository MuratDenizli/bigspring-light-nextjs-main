/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-lite-youtube-embed'],
  experimental: {
    esmExternals: 'loose'
  }
};

module.exports = nextConfig;
