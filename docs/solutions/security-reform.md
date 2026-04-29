# 个人博客安全性加固方案

## 1. 指导目标

防止恶意脚本注入 (XSS)、跨站请求伪造 (CSRF) 以及 Notion 内容中的链接劫持，确保博客作为静态内容的展示是绝对安全的。

## 2. 具体整改措施

### 2.1 链接与伪协议切断 (XSS 防护)

* **URL 校验**：在 `renderer.ts` 中引入 `isValidUrl` 验证器。
* **白名单协议**：仅允许 `http`, `https`, `mailto`, `tel`。
* **正则阻断**：严格屏蔽 `javascript:`, `data:`, `vbscript:` 等潜在 payload。
* **noopener**：对所有外链强制添加 `rel="noopener noreferrer"`。

### 2.2 HTTP 安全响应头 (Server Side)

在 `next.config.ts` 引入 `headers()` 配置，注入以下生产级防护：

* **Content-Security-Policy (CSP)**：限制脚本、样式、图片的数据源，禁止内联脚本。
* **Strict-Transport-Security (HSTS)**：强制 HTTPS 访问。
* **X-Frame-Options: DENY**：防止点击劫持攻击。
* **X-Content-Type-Options: nosniff**：强制浏览器解析特定 MIME 类型。

### 2.3 数据清洗与序列化

* **Markdown 渲染过滤**：对注入的 HTML 内容进行自动转义或通过插件进行节点级的。
* **错误日志脱敏**：移除 `logger` 中可能输出的 Notion Token 或 API Key。

## 3. 验证方式

* 使用 `securityheaders.com` 进行等级扫描。
* 手动在 Notion 插入 `[Attack](javascript:alert(1))` 进行拦截测试。
