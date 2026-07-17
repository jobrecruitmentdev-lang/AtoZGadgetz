import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.atozgadgetz.com' },
      { protocol: 'https', hostname: 'cc-west-usa.oss-accelerate.aliyuncs.com' },
      { protocol: 'https', hostname: 'cc-west-usa.oss-us-west-1.aliyuncs.com' },
    ],
  },
};

export default nextConfig;
