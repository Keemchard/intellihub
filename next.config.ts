import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: "/intellihub",
  env: { NEXT_PUBLIC_BASE_PATH: "/intellihub" },
  async redirects() {
    return [
      { source: "/", destination: "/intellihub", permanent: false, basePath: false },
    ];
  },
};

export default nextConfig;
