import type { NextConfig } from "next";

// 📊 Bundle Analyzer (enable with ANALYZE=true npm run build)
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  // ⚡ Performance Optimizations
  reactStrictMode: true,

  // 🔒 Security Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.supabase.co https://*.supabase.co wss://*.supabase.co http://localhost:* https://localhost:* ws://localhost:* wss://localhost:*",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // 🚀 Compilación optimizada
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // 📦 Optimización de bundle
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-accordion",
      "framer-motion",
    ],
  },

  // 📦 External packages (moved from experimental)
  serverExternalPackages: ["xlsx"],

  // 🖼️ Optimización de imágenes
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/webp", "image/avif"],
    // base64 QR sin optimizar
    unoptimized: true,
    minimumCacheTTL: 60,
  },

  // 🔄 Revalidación y caching
  onDemandEntries: {
    // Periodo que la página permanece en buffer (ms)
    maxInactiveAge: 60 * 1000,
    // Número de páginas que deben mantenerse simultáneamente
    pagesBufferLength: 5,
  },

  // 🚀 Turbopack config (Next.js 16+)
  turbopack: {
    // Empty config to silence webpack warning
    // Turbopack es más rápido y automático
  },
};

export default withBundleAnalyzer(nextConfig);
