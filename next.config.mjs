/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  // 发布时先构建到 .next-publish，成功后再原子切换到 .next。
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
