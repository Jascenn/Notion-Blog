# lingyi.bio → lingyi.me 迁移清单

> 状态：仅做准备，当前正式域名仍是 `https://lingyi.bio`。

## 切换前

- 确认 `lingyi.me` 的注册商控制权、DNS 和 HTTPS 正常。
- 将 `lingyi.me` 和 `www.lingyi.me` 加入同一个 Vercel 项目。
- 确定唯一主域名为 `https://lingyi.me`，`www` 永久跳转到主域名。
- 在 Google Search Console 和 Bing Webmaster 中添加并验证新域名，但暂不发送迁移信号。

## 切换当天

1. 先验证新域名首页、文章、中英文、HTTPS 和 `www` 跳转。
2. 在 Vercel Production 设置 `NEXT_PUBLIC_SITE_URL=https://lingyi.me`。
3. 设置 `ANALYTICS_SITE_NAME=lingyi.me`，Umami 保留原 Website ID，迁移期同时允许新旧域名。
4. 重新部署，检查 canonical、hreflang、Open Graph、JSON-LD、sitemap、robots、RSS 和 llms.txt。
5. 在 `lingyi.bio` 建立保留路径与查询参数的单跳 `301` 到 `lingyi.me`。
6. 在 Search Console 执行 Change of Address，Google/Bing 均提交新 sitemap。

## 切换后

- 旧域名续费并保留 `301` 至少 12 个月。
- 持续 2–4 周检查 404、索引覆盖、排名、Umami 流量与每日数据入库。
- 更新 GitHub、社交资料、外部友链和 RSS 阅读器中的旧链接。
