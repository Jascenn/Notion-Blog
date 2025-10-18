import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ExternalLinkIcon from "@/components/ExternalLinkIcon";
import ScrollToTop from "@/components/ScrollToTop";
import ReadingProgress from "@/components/ReadingProgress";

export const metadata: Metadata = {
  title: {
    default: "我的博客",
    template: "%s | 我的博客",
  },
  description: "分享技术与生活的点点滴滴，记录成长足迹",
  keywords: ["博客", "技术", "生活", "分享", "Next.js", "React"],
  authors: [{ name: "博主" }],
  creator: "博主",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" style={{ scrollBehavior: 'smooth' }}>
      <body
        className="font-sans antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        suppressHydrationWarning={true}
      >
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
