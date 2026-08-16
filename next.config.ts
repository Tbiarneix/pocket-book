import type { NextConfig } from "next";

// Server-only (never exposed to the browser): the real PocketBase origin.
// The client only ever talks to same-origin `/pb/*`, which Vercel/Next
// rewrites to this URL server-side — avoids the browser blocking a plain
// HTTP PocketBase as mixed content on an HTTPS page.
const POCKETBASE_UPSTREAM_URL = process.env.POCKETBASE_UPSTREAM_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!POCKETBASE_UPSTREAM_URL) return [];

    return [
      {
        source: "/pb/:path*",
        destination: `${POCKETBASE_UPSTREAM_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
