# 发布前安全检查清单

在将项目公开到 GitHub 前，请按照此清单检查所有项目：

## ✅ 环境变量检查

- [ ] `.env.local` 已添加到 `.gitignore`
- [ ] `.env.example` 不包含任何真实的密钥或凭证
- [ ] 所有敏感配置都使用环境变量而非硬编码
- [ ] 已验证 `.env.local` 从未被提交到 Git 历史

```bash
# 检查 .env.local 是否曾被提交
git log --all --full-history -- .env.local
# 应该返回空（没有结果）
```

## ✅ 代码检查

- [ ] 源代码中无 API 密钥
- [ ] 源代码中无数据库凭证
- [ ] 源代码中无个人邮箱地址
- [ ] 源代码中无真实域名（使用示例域名或环境变量）
- [ ] About 页面使用通用示例而非个人信息

```bash
# 搜索可能的敏感信息
grep -r "api[_-]\?key" src/
grep -r "secret" src/
grep -r "password" src/
grep -r "@.*\.com" src/
```

## ✅ Git 历史检查

- [ ] 查看最近的提交，确保没有敏感信息
- [ ] 如果曾经提交过敏感信息，使用 BFG Repo-Cleaner 或 git-filter-repo 清理

```bash
# 查看最近的提交
git log --oneline -10

# 查看具体提交的内容
git show <commit-hash>
```

## ✅ 配置文件检查

- [ ] `next.config.ts` 无硬编码配置
- [ ] `vercel.json` 无敏感信息
- [ ] `package.json` 的 repository URL 正确

## ✅ 文档检查

- [ ] README.md 使用通用说明
- [ ] 创建了 NOTION_SETUP.md 指导用户配置
- [ ] .env.example 提供完整的配置模板
- [ ] 文档中无个人敏感信息

## ✅ 公开仓库前

如果你的仓库当前是私有的，在公开前：

1. **运行完整扫描**：
```bash
# 使用 trufflehog 扫描（如果已安装）
trufflehog filesystem . --only-verified

# 或使用 git-secrets（如果已安装）
git secrets --scan
```

2. **最终检查**：
```bash
# 确认 .gitignore 正确
cat .gitignore | grep -E "env|secret|key"

# 确认当前状态
git status

# 查看未跟踪的文件
git ls-files --others --exclude-standard
```

3. **清理不必要的文件**：
```bash
# 删除本地环境文件
rm .env.local

# 删除日志文件
rm -rf logs/
```

## 🔐 安全最佳实践

### 1. API 密钥轮换

如果你的密钥曾经被提交到 Git，即使已经删除，也应该立即轮换：

- **Notion**: 删除旧的 Integration，创建新的
- **Cloudflare**: 在 Dashboard 中撤销旧的 API Token，生成新的
- **Vercel KV**: 在 Vercel Dashboard 中重新生成

### 2. 使用 Git Hooks

添加 pre-commit hook 防止意外提交敏感文件：

```bash
# .git/hooks/pre-commit
#!/bin/sh
if git diff --cached --name-only | grep -q "\.env\.local$"; then
    echo "Error: Attempting to commit .env.local file!"
    exit 1
fi
```

### 3. GitHub 设置

公开仓库后：

- 启用 "Secret scanning" (GitHub 自动扫描)
- 启用 "Dependabot alerts"
- 添加 `.github/dependabot.yml` 配置自动更新依赖

## 📋 发布检查表

最后确认：

```bash
# 1. 确认所有更改已提交
git status

# 2. 确认 .env.local 不在跟踪中
git ls-files | grep .env.local
# 应该返回空

# 3. 推送到私有仓库测试
git push origin main

# 4. 在另一台机器上克隆测试
cd /tmp
git clone <your-repo-url> test-clone
cd test-clone
ls -la
# 确认没有 .env.local

# 5. 如果一切正常，将仓库设置为公开
```

## ⚠️ 如果不小心泄露了密钥

1. **立即轮换所有密钥**
2. **检查是否有异常活动**（API 调用日志、账户活动等）
3. **使用 BFG Repo-Cleaner 清理历史**：
   ```bash
   # 下载 BFG
   # https://rtyley.github.io/bfg-repo-cleaner/

   # 清理密钥
   java -jar bfg.jar --replace-text passwords.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```
4. **通知相关服务提供商**（如果密钥可能已被使用）

## 📚 参考资源

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [OWASP: Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [git-secrets](https://github.com/awslabs/git-secrets)
- [trufflehog](https://github.com/trufflesecurity/trufflehog)
