import type { NextConfig } from "next";
import { isProductionSite } from "./lib/config";

const wordpressOrigin = new URL(
  process.env.WORDPRESS_SITE_URL ?? "https://medicinasagrada.com.br",
);

const allowedPlayers = "https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://player.vimeo.com";

// Observe tighter resource rules before enforcing them on legacy CMS content.
// Inline Next.js hydration needs nonces or hashes before script-src can be strict.
const reportOnlyCsp = [
  "default-src 'self'",
  `script-src 'self'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://use.typekit.net https://p.typekit.net",
  "font-src 'self' data: https://use.typekit.net https://p.typekit.net",
  `img-src 'self' data: blob: ${wordpressOrigin.origin} https://i.ytimg.com https://img.youtube.com`,
  `connect-src 'self'${process.env.NODE_ENV === "development" ? " ws: wss:" : ""}`,
  `frame-src ${allowedPlayers}`,
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    localPatterns: [
      {
        pathname: "/assets/**",
        search: "",
      },
      {
        pathname: "/assets/ethnicity-headers/**",
      },
    ],
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
          ...(!isProductionSite ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
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
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-src ${allowedPlayers}`,
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: reportOnlyCsp,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Strict-Transport-Security", value: "max-age=86400" }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
