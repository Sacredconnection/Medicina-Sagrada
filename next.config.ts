import type { NextConfig } from "next";

const wordpressOrigin = new URL(
  process.env.WORDPRESS_SITE_URL ?? "https://medicinasagrada.com.br",
);

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: wordpressOrigin.protocol.replace(":", "") as "http" | "https",
        hostname: wordpressOrigin.hostname,
        port: wordpressOrigin.port,
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
