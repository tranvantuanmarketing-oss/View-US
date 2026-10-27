/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_BUILD_DIR || ".next",
  images: {
    unoptimized: true,
  },
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ["better-sqlite3", "archiver", "ffmpeg-static"],
  },
};

export default nextConfig;

