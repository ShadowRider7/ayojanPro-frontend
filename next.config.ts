import type { NextConfig } from "next";

/**
 * The app is deployed as a Next.js server on Vercel, not as a static export.
 *
 * A static export has no server to render a route on demand, so every
 * `[id]` route would only exist under the one path that `generateStaticParams`
 * returned. `/events/<id>`, `/professionals/<id>` and `/dashboard/events/<id>`
 * all answered with a 404 on Vercel. A server renders them per request and
 * the client router can fetch the payload for any id.
 */
const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
