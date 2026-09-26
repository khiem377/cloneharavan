import type { NextConfig } from "next";

const BACKEND_URL = process.env.API_SERVER_URL || "http://127.0.0.1:5000/api/v1";

const nextConfig: NextConfig = {
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
