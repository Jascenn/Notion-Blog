# lingyi.bio 访问分析

本站使用 Umami 收集页面访问和必要的交互事件。未配置 Website ID 时，分析组件不会加载任何第三方脚本。

## 1. 创建站点

1. 登录 Umami Cloud，或使用自建 Umami。
2. 新建站点 `lingyi.bio`。
3. 复制 Website ID。
4. 如果需要用脚本读取数据，在 Umami 设置中创建 API Key。

## 2. 配置 Vercel

在 Vercel 项目的 Environment Variables 中加入：

```dotenv
NEXT_PUBLIC_UMAMI_WEBSITE_ID=你的-website-id
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://cloud.umami.is/script.js
```

`NEXT_PUBLIC_UMAMI_WEBSITE_ID` 会出现在网页源码中，这是追踪脚本的正常工作方式，不是密钥。

重新部署后访问站点，Umami 面板应在短时间内出现访问数据。

## 3. 已收集的数据

- 页面访问、访客和会话
- 访问来源和 UTM 参数
- 国家/地区、设备、浏览器和操作系统
- 跳出与访问时长
- 文章分享方式
- About 页项目、GitHub 和个人故事入口点击
- 友情链接点击

未来添加产品按钮时，按同样格式加上：

```html
<a
  href="https://example.com"
  data-umami-event="product-click"
  data-umami-event-product="product-name"
>
  查看产品
</a>
```

## 4. 导出到其他工具

在本地 `.env.local` 加入：

```dotenv
UMAMI_WEBSITE_ID=你的-website-id
UMAMI_API_KEY=你的-api-key
UMAMI_API_BASE=https://api.umami.is/v1
```

导出程序优先使用 `UMAMI_API_KEY`；没有 API Key 时会自动使用当前免费的
`UMAMI_SHARE_SLUG` 和 `UMAMI_SHARE_GATEWAY` 只读接口。任何密钥和分享 slug
都不得加 `NEXT_PUBLIC_` 前缀，也不得提交到 Git。

导出最近 30 天数据：

```bash
npm run analytics:export -- --days=30 --output=analytics-30d.json
```

更换 `days` 可导出不同时间范围。JSON 中包含汇总、访问时间序列，以及页面、来源、渠道、国家、设备、浏览器、系统和自定义事件维度。

直接导出适合 Excel、飞书、DuckDB 和其他分析工具的长表 CSV：

```bash
npm run analytics:export -- --days=30 --format=csv --output=analytics-30d.csv
```

CSV 使用 `dataset / metric / timestamp / label / value` 五列保存汇总、时间序列和各维度指标，带 UTF-8 BOM，中文 Excel 可直接打开。

这个文件可以继续导入：

- Python / Pandas
- DuckDB
- Excel 或飞书表格
- BigQuery 或其他数据仓库
- 支持 JSON 的 AI 分析工具

Umami Cloud 后台也可以直接生成包含页面访问、事件和会话的 CSV 完整导出。

## 5. 每日同步到 Notion

生产环境每天北京时间 `09:00-09:59` 之间由 Vercel Cron 调用
`/api/cron/analytics`。同步程序会：

1. 使用 Umami Share URL 拉取前一天的完整汇总和维度数据；
2. 以「日期」为唯一键在 Notion 中创建、更新或跳过记录；
3. 发现同一天有多行时直接失败，避免覆盖错误数据。

同步异常会带上 `daily-analytics-sync` 标签发送到项目现有的 Sentry；生产环境已配置 DSN，后续可在 Sentry 中设置仅新错误或持续失败时通知。

本地命令还会按 `analytics-data/YYYY/MM/YYYY-MM-DD.json` 保存完整快照，
用于后续导入 DuckDB、Excel、飞书或其他分析工具；这个目录不会提交到 Git。

Vercel 生产环境需要配置：

```dotenv
UMAMI_SHARE_SLUG=分享链接中的-slug
UMAMI_SHARE_GATEWAY=https://gateway-us.umami.is/api
UMAMI_WEBSITE_ID=Umami-Website-ID
NOTION_ANALYTICS_DATA_SOURCE_ID=每日访问数据的数据源-ID
CRON_SECRET=随机长字符串
```

`NOTION_TOKEN` 对应的 Notion Integration 只需被邀请到「网站访问统计」页面，
不要授权整个工作区。Vercel Cron 的时间表达式使用 UTC；Hobby 计划按小时调度，
因此 `01:00` 对应北京时间 `09:00-09:59` 之间执行，不能保证精确到分钟。

本地只取数并生成 JSON，不写 Notion：

```bash
npm run analytics:sync:dry-run -- --date=2026-09-18
```

本地执行完整同步：

```bash
npm run analytics:sync -- --date=2026-09-18
```
