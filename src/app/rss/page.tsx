import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RSS Feed',
  description: '订阅博客RSS源',
};

export default function RSSPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.bio';
  const feedUrl = `${siteUrl.replace(/\/$/, '')}/rss.xml`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          RSS Feed
        </h1>

        <div className="space-y-6">
          <div>
            <p className="text-gray-600 leading-relaxed mb-4">
              通过RSS订阅获取博客最新文章更新。RSS是一种Web内容聚合格式，让你可以在RSS阅读器中方便地跟踪博客更新。
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">
              RSS Feed地址
            </h2>
            <div className="bg-white border border-gray-200 rounded px-3 py-2 font-mono text-sm text-gray-700">
              {feedUrl}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              复制此地址到你的RSS阅读器中即可订阅
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-3">
              推荐的RSS阅读器
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li>• <strong>Feedly</strong> - 网页版和移动端</li>
              <li>• <strong>Inoreader</strong> - 功能丰富的在线阅读器</li>
              <li>• <strong>NetNewsWire</strong> - Mac和iOS免费应用</li>
              <li>• <strong>Reeder</strong> - macOS和iOS优秀客户端</li>
            </ul>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500">
              RSS 订阅已可用，如果阅读器暂时无法解析，请稍后刷新。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
