import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 页面走丢了",
  description: "您要找的页面不存在、已被移动或地址输入有误。",
  robots: { index: false, follow: false },
  openGraph: {
    title: "404 页面走丢了",
    description: "您要找的页面不存在、已被移动或地址输入有误。",
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative">
      {/* 装饰背景：跟 lingyi.tools 404 同款呼吸圆点 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-10 h-10 bg-gray-900/5 dark:bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gray-900/5 dark:bg-white/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-gray-900/5 dark:bg-white/5 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-12 h-12 bg-gray-900/5 dark:bg-white/5 rounded-full animate-pulse delay-3000"></div>
      </div>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
        <div className="max-w-2xl w-full text-center space-y-5">
          <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400">
            404
          </div>
          <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100">
            页面走丢了
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            看起来您要找的页面正在宇宙中漂浮，不过别担心，它可能只是在探索新的维度。
          </p>
        </div>
      </div>
    </div>
  );
}
