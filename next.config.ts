import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [],
    remotePatterns: [],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "",
    formats: ["image/webp"],
    // base64 QR sin optimizar
    unoptimized: true,
  },
};

export default nextConfig;
