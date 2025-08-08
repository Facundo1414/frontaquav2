import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
  domains: [],
  remotePatterns: [],
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: '',
  formats: ['image/webp'],
  // 👇 esto es clave para base64 QR
  unoptimized: true,
}

};

export default nextConfig;
