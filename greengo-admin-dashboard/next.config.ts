import type { NextConfig } from "next";

const apiProxyTarget =
  process.env.API_PROXY_TARGET ||
  process.env.BACKEND_API_URL ||
  "https://greengo.up.railway.app";

const nextConfig: NextConfig = {
  /* config options here */
  // Proxy API requests to avoid CORS issues in development
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${apiProxyTarget.replace(/\/$/, "")}/:path*`,
      },
      {
        source: '/api-local/:path*',
        // Local backend proxy
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: '**.gstatic.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '172.20.10.2',
      },
      {
        protocol: 'https',
        hostname: 'greengo.up.railway.app',
      },
      {
        protocol: 'https',
        hostname: 'imageproxy.wolt.com',
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
    
  turbopack: {
    root: process.cwd(),
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
};

export default nextConfig;
