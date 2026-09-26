'use client';

import { useState } from 'react';
import previewStyles from '@/app/preview/optimized/optimized.module.css';

const changelogData = [
  {
    version: 'v1.3.0',
    date: '2025-11-08',
    title: '字体加载优化与部署配置改进',
    changes: [
      { type: '修复', color: 'text-red-500', text: '修复移动端字体加载失败问题' },
      { type: '优化', color: 'text-blue-500', text: '切换字体 CDN 从 Google Fonts 到 jsDelivr' },
      { type: '优化', color: 'text-blue-500', text: '使用 CSS 变量统一管理字体配置' },
      { type: '修复', color: 'text-red-500', text: '修复 Vercel 多区域部署配置兼容性' },
      { type: '新增', color: 'text-green-500', text: '新增技术问题解决方案文档' },
    ]
  },
  {
    version: 'v1.2.0',
    date: '2025-11-05',
    title: '项目结构优化与功能改进',
    changes: [
      { type: '修复', color: 'text-red-500', text: 'Callout 块子内容不显示问题' },
      { type: '优化', color: 'text-blue-500', text: 'Callout 块样式间距' },
      { type: '维护', color: 'text-gray-500', text: '重组文档结构,配置 lingyi.bio 域名' },
    ]
  },
  {
    version: 'v1.1.0',
    date: '2025-10-25',
    title: '核心功能完善',
    changes: [
      { type: '新增', color: 'text-green-500', text: '文章置顶功能' },
      { type: '新增', color: 'text-green-500', text: '网站公告系统' },
      { type: '优化', color: 'text-blue-500', text: '深色模式和缓存策略' },
    ]
  },
  {
    version: 'v1.0.0',
    date: '2025-09-28',
    title: '初始版本发布',
    changes: [
      { type: '新增', color: 'text-green-500', text: 'Next.js 15 + Notion API 集成' },
      { type: '新增', color: 'text-green-500', text: '21 种 Notion 块类型支持' },
      { type: '新增', color: 'text-green-500', text: '全文搜索、标签系统、RSS 订阅' },
    ]
  }
];

export default function ChangelogSection({ variant = 'default' }: { variant?: 'default' | 'optimized' }) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'optimized') {
    const latestEntry = changelogData[0];

    return (
      <section className={previewStyles.changelogSection} aria-labelledby="optimized-changelog-title">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={previewStyles.changelogToggle}
          aria-expanded={isOpen}
          aria-controls="optimized-changelog-content"
        >
          <span className={previewStyles.changelogHeading}>
            <span className={previewStyles.kicker}>CHANGELOG / 更新日志</span>
            <span id="optimized-changelog-title" className={previewStyles.changelogTitle}>网站的版本记录</span>
            <span className={previewStyles.changelogSummary}>
              最近更新 {latestEntry.date} · {changelogData.length} 个版本
            </span>
          </span>
          <span className={`${previewStyles.changelogAction} ${isOpen ? previewStyles.changelogActionOpen : ''}`}>
            {isOpen ? '收起' : '展开全部'}
            <span aria-hidden="true">+</span>
          </span>
        </button>

        <div
          id="optimized-changelog-content"
          className={`${previewStyles.changelogBody} ${isOpen ? previewStyles.changelogOpen : ''}`}
          aria-hidden={!isOpen}
        >
          <div className={previewStyles.changelogBodyInner}>
            <div className={previewStyles.changelogList}>
              {changelogData.map((entry) => (
                <article key={entry.version} className={previewStyles.changelogEntry}>
                  <div className={previewStyles.changelogVersion}>
                    <strong>{entry.version}</strong>
                    <time dateTime={entry.date}>{entry.date}</time>
                  </div>
                  <h3>{entry.title}</h3>
                  <ul>
                    {entry.changes.map((change, changeIndex) => (
                      <li key={changeIndex}>
                        <span data-change-type={change.type}>{change.type}</span>
                        <span>{change.text}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-12">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group"
      >
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
          CHANGELOG
        </h2>
        <span className={`text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100 mt-6' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-8">
          {changelogData.map((entry) => (
            <div key={entry.version}>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {entry.version}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {entry.date}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {entry.title}
              </p>
              <ul className="space-y-2 text-sm">
                {entry.changes.map((change, changeIndex) => (
                  <li key={changeIndex} className="flex items-start gap-2">
                    <span className={`${change.color} font-medium`}>
                      {change.type}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {change.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
