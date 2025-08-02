const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Preserve React strict mode
  reactStrictMode: true,

  // Webpack configuration to maintain import aliases
  webpack: (config) => {
    // Preserve @/ import alias to root directory
    config.resolve.alias['@'] = path.join(__dirname, './');
    
    return config;
  },

  // Only allow images from trusted domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'degentalk.net',
      },
      {
        protocol: 'https',
        hostname: '*.degentalk.net', // Allow subdomains like cdn.degentalk.net
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // If using Unsplash for placeholder images
      },
      // Add other trusted image CDNs as needed
    ],
  },

  // Preserve trailing slashes behavior
  trailingSlash: false,

  // Enable SWC minification for better performance
  swcMinify: true,

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Configure headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;