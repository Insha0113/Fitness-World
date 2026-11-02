import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the user home folder confuses root detection.
  turbopack: { root: __dirname },
  images: {
    deviceSizes: [640, 828, 1080, 1366, 1600, 2048],
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async redirects() {
    return [
      { source: "/about", destination: "/our-story", permanent: true },
      { source: "/membership", destination: "/memberships", permanent: true },
      { source: "/register", destination: "/join", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
