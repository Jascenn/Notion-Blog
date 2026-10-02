import { NextResponse } from 'next/server';
import { absoluteSiteUrl } from '@/lib/site-config';

export const revalidate = 3600;

export function GET() {
  const body = `# 凌一 LingYi

> 凌一的个人主站与博客，记录全栈开发、AI 工具、效率工作流、项目实践与生活思考。

## 主要页面

- [首页与文章列表](${absoluteSiteUrl('/')})
- [关于凌一](${absoluteSiteUrl('/about')})
- [站内搜索](${absoluteSiteUrl('/search')})
- [RSS 订阅](${absoluteSiteUrl('/rss.xml')})

## 代表文章

- [AI 辅助编程完成了全栈项目](${absoluteSiteUrl('/20260106-ai-quanzhan')})
- [再见 2025，你好 2026](${absoluteSiteUrl('/20260102-2025-report')})
- [架构笔记：我的博客技术栈](${absoluteSiteUrl('/blog-stack-notes')})

## 项目与身份

- [lingyi.tools](https://lingyi.tools/)：凌一构建的 AI 工具与实用资源站。
- [LionCC](https://lioncc.ai/)：Claude Code 相关工具。
- [OpenClaw](https://openclaw.ai/)：AI 助手框架。
- [GitHub](https://github.com/Jascenn)：凌一的开源项目与代码。
`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
