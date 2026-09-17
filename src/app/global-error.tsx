'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body>
        <main className="min-h-screen flex items-center justify-center px-4 bg-white text-gray-900">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-semibold mb-2">网站暂时出了点问题</h1>
            <p className="text-gray-600 mb-8">错误已自动记录，请稍后重试。</p>
            <button
              type="button"
              onClick={reset}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              重试
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
