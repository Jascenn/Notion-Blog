import type { Metadata } from 'next';
import MarkdownContent from '@/components/MarkdownContent';
import { getAboutPage } from '@/lib/notion';

export const metadata: Metadata = {
  title: '关于',
  description: '了解博主的个人信息和创作理念',
};

export default async function AboutPage() {
  let aboutContent = null;

  try {
    aboutContent = await getAboutPage();
  } catch (error) {
    console.error('Error loading about page from Notion:', error);
  }
  // 如果有 Notion 内容，使用 Notion 内容
  if (aboutContent) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {aboutContent.title}
            </h1>
            {aboutContent.excerpt && (
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {aboutContent.excerpt}
              </p>
            )}
          </div>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <MarkdownContent content={aboutContent.content} />
          </div>
        </div>
      </div>
    );
  }

  // 使用默认内容作为 fallback
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        {/* 页面标题 */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            凌一 / LingYi_Stu
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Keep it simple, stay focused.
          </p>
        </div>

        {/* 内容区域 */}
        <div className="space-y-12">
          {/* 个人简介 - 极简风格 */}
          <div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-4">
              全栈开发者，专注于创建简洁而强大的数字体验。
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              我相信好的代码如同好的文章，需要反复推敲和打磨。在这里，我分享技术思考、项目经验和生活感悟。
            </p>
          </div>

          {/* 当前专注 */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">CURRENTLY FOCUSING ON</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-gray-400">•</span>
                <span className="text-gray-700 dark:text-gray-300">构建 lingyi.tools 在线工具集</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400">•</span>
                <span className="text-gray-700 dark:text-gray-300">探索 AI 与前端开发的结合</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400">•</span>
                <span className="text-gray-700 dark:text-gray-300">优化用户体验与性能</span>
              </div>
            </div>
          </div>

          {/* 项目展示 */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">SELECTED PROJECTS</h2>
            <div className="space-y-4">
              <a
                href="https://lingyi.tools"
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                      lingyi.tools
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      实用在线工具集合，包含进制转换、密码检测等日常工具
                    </p>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600 transition-colors">↗</span>
                </div>
              </a>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">个人博客系统</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    基于 Next.js 构建的极简博客，支持 Markdown 和实时搜索
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">开源贡献</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    活跃于开源社区，持续贡献代码和文档
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 技术栈 - 精简版 */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">TECH STACK</h2>
            <div className="flex flex-wrap gap-2">
              {[
                'React', 'Next.js', 'TypeScript', 'Node.js',
                'Tailwind CSS', 'Python', 'Git'
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-full hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* 联系方式 - 极简设计 */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-12">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">GET IN TOUCH</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email</span>
                <a
                  href="mailto:1286324609@qq.com"
                  className="text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  1286324609@qq.com
                </a>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">GitHub</span>
                <a
                  href="https://github.com/Jascenn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  @Jascenn
                </a>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">WeChat</span>
                <span className="text-gray-900 dark:text-gray-100 font-mono">Help000000</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Website</span>
                <a
                  href="https://lingyi.tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  lingyi.tools
                </a>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
              <a
                href="https://mp.weixin.qq.com/s/57ZddMBqXFTP89YJs3lR9A"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                了解更多关于我的故事 →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}