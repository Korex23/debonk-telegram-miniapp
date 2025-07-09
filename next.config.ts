import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // Disables type checking during build
  },
  eslint: {
    // ✅ Ignores ESLint errors during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
