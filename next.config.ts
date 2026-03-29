import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bypass Next.js internal TS check — we run `tsc --noEmit` separately (Turbopack/Windows path bug)
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
