// 各页面的 metadata.alternates 会整体覆盖 root layout 的配置，
// RSS 自动发现链接必须随每个页面的 alternates 一起输出
export const RSS_ALTERNATE_TYPES = {
  types: {
    'application/rss+xml': '/rss.xml',
  },
} as const;
