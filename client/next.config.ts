import type { NextConfig } from "next";

const BACKEND_URL = process.env.API_SERVER_URL || "http://127.0.0.1:5000/api/v1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@tanstack/react-query',
      'clsx',
      'tailwind-merge',
      'zustand',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
