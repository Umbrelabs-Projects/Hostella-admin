import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Next.js 16 Configuration */
  env: {
    API_URL: process.env.API_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
