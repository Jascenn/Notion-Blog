"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function LinkIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

/**
 * 从地址栏里拆出粘连在一起的网址
 * 场景：微信等客户端复制多行网址时，两条网址被粘成一条，
 * 打开后落到 404。识别出来后直接给出拆分结果，而不是干巴巴的 404。
 * （思路来源：@gefei55）
 */
function detectGluedUrls(raw: string): string[] {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    // 解码失败就用原文继续
  }
  // 注意：浏览器/网关会把地址栏里的 // 压成 /（比如 https://a.com → https:/a.com），
  // 所以单斜杠和双斜杠都要认；用 tempered 模式让每条匹配在下一个 http(s) 开头处停下
  const matches =
    decoded.match(/https?:\/{1,2}(?:(?!https?:\/{1,2})[^\s"'<>\]])+/gi) || [];
  const normalized = matches.map((u) =>
    u
      .replace(/^(https?:\/)(?!\/)/i, "$1/")
      .replace(/[.,;!?]+$/, "")
  );
  // 去重且至少两条才算粘连
  const unique = Array.from(new Set(normalized));
  return unique.length >= 2 ? unique : [];
}

/** 从路径里提取可用于搜索的关键词 */
function extractKeywords(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean).pop() || "";
  return seg
    .replace(/\.(html?|php|aspx?)$/i, "")
    .replace(/[-_+]+/g, " ")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [gluedUrls, setGluedUrls] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const raw =
      window.location.pathname + window.location.search + window.location.hash;
    const glued = detectGluedUrls(raw);
    setGluedUrls(glued);
    if (glued.length === 0) {
      const kw = extractKeywords(window.location.pathname);
      if (kw) setQuery(kw);
    }
  }, []);

  const goSearch = (q: string) => {
    const v = q.trim();
    if (v) window.location.href = `/search?q=${encodeURIComponent(v)}`;
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(url);
    window.setTimeout(() => setCopied((c) => (c === url ? null : c)), 1500);
  };

  if (!mounted) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative">
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
        <div className="max-w-2xl w-full text-center space-y-7">
          {/* 404 主视觉 */}
          <div className="space-y-5">
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

          {/* 粘连网址识别面板 */}
          {gluedUrls.length > 0 && (
            <div className="text-left rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                <LinkIcon className="w-5 h-5 text-amber-500" />
                <span>这个网址看起来是多条网址粘在了一起</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                从微信等客户端复制多行网址时，相邻两行容易被粘成一条，导致打不开。这不是我们给错了地址，把下面拆开后的网址单独打开就行。
              </p>
              <div className="space-y-2">
                {gluedUrls.map((url) => (
                  <div
                    key={url}
                    className="flex items-center gap-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-2"
                  >
                    <span className="flex-1 truncate text-sm font-mono text-gray-800 dark:text-gray-200">
                      {url}
                    </span>
                    <button
                      onClick={() => copyUrl(url)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {copied === url ? (
                        <span className="text-green-500">✓</span>
                      ) : null}
                      {copied === url ? "已复制" : "复制"}
                    </button>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
                    >
                      打开 <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 搜索框：回车跳站内搜索 */}
          <div className="relative max-w-sm mx-auto">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") goSearch(query);
              }}
              placeholder="搜索文章标题、关键词试试…"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-9 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="清空搜索"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <span className="text-base leading-none">×</span>
              </button>
            )}
          </div>

          {/* 弱返回首页 */}
          <div className="pt-3">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
