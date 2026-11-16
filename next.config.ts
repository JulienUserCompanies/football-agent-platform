import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Off: every page depends on the signed-in user's auth/subscription
  // state (cookies), so there's nothing worth statically caching here.
  cacheComponents: false,
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
