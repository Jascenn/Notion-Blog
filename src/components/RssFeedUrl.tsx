'use client';

import { useState } from 'react';

export default function RssFeedUrl({ feedUrl }: { feedUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function copyFeedUrl() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
        <code className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 font-mono text-sm text-gray-700 dark:text-gray-300 break-all">
        {feedUrl}
      </code>
      <button
        type="button"
        onClick={copyFeedUrl}
        className="shrink-0 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        {copied ? '已复制' : '复制'}
      </button>
    </div>
  );
}
