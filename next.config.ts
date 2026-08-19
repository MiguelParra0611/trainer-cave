import type { NextConfig } from "next";

// Security headers applied to every response. CSP is scoped to the hosts
// this app actually talks to: Supabase (auth/rest/storage) for the browser
// client, and the image hosts already whitelisted below for next/image.
// 'unsafe-eval' is only added outside production — Next/React's dev mode
// (Turbopack HMR, component stack reconstruction) needs eval(), but React
// itself guarantees it never uses eval() in a production build.
const isDev = process.env.NODE_ENV !== "production";
const contentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.supabase.co https://raw.githubusercontent.com;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com${isDev ? " ws://localhost:* http://localhost:*" : ""};
  frame-src https://challenges.cloudflare.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
