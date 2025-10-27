const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      yjs: path.resolve(process.cwd(), 'node_modules/yjs'),
      '@hocuspocus/common': path.resolve(process.cwd(), 'node_modules/@hocuspocus/common'),
      '@hocuspocus/provider': path.resolve(process.cwd(), 'node_modules/@hocuspocus/provider'),
    };
    return config;
  },
};

module.exports = nextConfig;