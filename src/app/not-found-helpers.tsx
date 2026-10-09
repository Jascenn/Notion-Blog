"use client";

import { useEffect, useState } from "react";

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
    /* 解码失败就用原文继续 */
  }
  const matches = decoded.match(/https?:\/\/[^\s"'<>\]]+/gi) || [];
  const unique = Array.from(
    new Set(matches.map((u) => u.replace(/[.,;!?]+$/, "")))
  );
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

export default function NotFoundHelpers() {
  const [gluedUrls, setGluedUrls] = useState<string[]>([]);
  const [keywords, setKeywords] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const raw =
      window.location.pathname + window.location.search + window.location.hash;
    setGluedUrls(detectGluedUrls(raw));
    setKeywords(extractKeywords(window.location.pathname));
  }, []);

  if (!mounted) return null;

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

  if (gluedUrls.length === 0 && !keywords) return null;

  return (
    <div className="w-full max-w-md mx-auto mt-8 space-y-4 text-left">
      {gluedUrls.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            这个网址看起来是多条网址粘在了一起
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
                  className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                >
                  {copied === url ? "已复制" : "复制"}
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 transition-opacity shrink-0"
                >
                  打开
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {gluedUrls.length === 0 && keywords && (
        <div className="text-center">
          <a
            href={`/search?q=${encodeURIComponent(keywords)}`}
            className="inline-flex items-center px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            搜索「{keywords.length > 24 ? keywords.slice(0, 24) + "…" : keywords}」
          </a>
        </div>
      )}
    </div>
  );
}
