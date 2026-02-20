// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.careerlabconsulting.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;