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

API Key 不得加 `NEXT_PUBLIC_` 前缀，不得提交到 Git。

导出最近 30 天数据：

```bash
npm run analytics:export -- --days=30 --output=analytics-30d.json
```

更换 `days` 可导出不同时间范围。JSON 中包含汇总、访问时间序列，以及页面、来源、渠道、国家、设备、浏览器、系统和自定义事件维度。

这个文件可以继续导入：

- Python / Pandas
- DuckDB
- Excel 或飞书表格（先转换成 CSV）
- BigQuery 或其他数据仓库
- 支持 JSON 的 AI 分析工具

Umami Cloud 后台也可以直接生成包含页面访问、事件和会话的 CSV 完整导出。

