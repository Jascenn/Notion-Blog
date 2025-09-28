import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 现在代码质量已经很高，启用严格检查
  eslint: {
    // 启用构建时的 ESLint 检查
    ignoreDuringBuilds: false,
  },
  typescript: {
    // 启用构建时的 TypeScript 检查
    ignoreBuildErrors: false,
  },

  // 图片优化配置
  images: {
    // 允许外链图片
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // 增加图片加载超时时间
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // 增加超时时间到60秒
    minimumCacheTTL: 60,
  },
}

export default nextConfig;
