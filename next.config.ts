import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client"],
  // Cloudflare Pages compatibility
  experimental: {
    // Enable edge runtime for all routes
  },
};

export default nextConfig;
