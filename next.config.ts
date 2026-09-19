import type {NextConfig} from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Mengizinkan origin dev lokal & IP server pengujian
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  typescript: {
    ignoreBuildErrors: false,
  },

  compiler: {
    removeConsole: isProduction
      ? {
          exclude: ["error", "warn"],
        }
      : false,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      // Mendukung gambar dari host lokal HTTP saat development
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "103.171.154.43",
        pathname: "/**",
      },
    ],
  },

  experimental: {
    // Optimasi tree-shaking icon dan komponen UI
    optimizePackageImports: ["lucide-react", "framer-motion", "react-markdown"],
    // Batasan payload upload untuk Server Actions (ganti proxyClientMaxBodySize)
    serverActions: {
      bodySizeLimit: "50mb", // Sesuaikan batas wajar upload bukti audit/snapshot (misal: 10mb - 50mb)
    },
  },
  generateEtags: false,
};

export default nextConfig;
