import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ExternalLinkIcon from "@/components/ExternalLinkIcon";
import ScrollToTop from "@/components/ScrollToTop";
import ReadingProgress from "@/components/ReadingProgress";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.bio'),
  title: {
    default: '凌一 LingYi — 全栈开发者 · 技术与生活博客',
    template: '%s | 凌一 LingYi',
  },
  description: '凌一（LingYi）的个人博客：全栈开发实践、AI 工具探索、效率工作流与生活随笔，记录从 0 到 1 的构建过程。',
  keywords: ['凌一', 'LingYi', '博客', '全栈开发', 'AI', '效率工具', '生活随笔', 'lingyi.tools'],
  authors: [{ name: '凌一 LingYi', url: 'https://lingyi.bio/about' }],
  creator: '凌一 LingYi',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '凌一 LingYi 的博客',
    title: '凌一 LingYi — 全栈开发者 · 技术与生活博客',
    description: '全栈开发实践、AI 工具探索、效率工作流与生活随笔，记录从 0 到 1 的构建过程。',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: '凌一 LingYi 的博客' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '凌一 LingYi — 全栈开发者 · 技术与生活博客',
    description: '全栈开发实践、AI 工具探索、效率工作流与生活随笔，记录从 0 到 1 的构建过程。',
    images: ['/og-default.png'],
  },
  alternates: {
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" style={{ scrollBehavior: 'smooth' }} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        {/* 提前下载实际使用的字重，样式在首屏就绪后启用，不阻塞初次渲染。 */}
        <link
          rel="preload"
          as="style"
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/lxgwwenkai-regular.css"
        />
        <link
          rel="preload"
          as="style"
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/lxgwwenkai-bold.css"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/lxgwwenkai-regular.css"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/lxgwwenkai-bold.css"
          />
        </noscript>
      </head>
      <body className="font-sans antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Script id="load-lxgw-wenkai" strategy="afterInteractive">
          {`
            for (const href of [
              'https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/lxgwwenkai-regular.css',
              'https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/lxgwwenkai-bold.css'
            ]) {
              if (document.querySelector('link[rel="stylesheet"][href="' + href + '"]')) continue;
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = href;
              document.head.appendChild(link);
            }
          `}
        </Script>
        <Analytics />
        <ReadingProgress />
        <Navigation />
        <main className="min-h-screen bg-white dark:bg-gray-900">
          {children}
        </main>
        <Footer />
        <ExternalLinkIcon />
        <ScrollToTop />
      </body>
    </html>
  );
}
