import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  console.log('\n🚀 欢迎使用 Notion-Blog 快速设置向导！');
  console.log('我们将帮助你生成 .env.local 文件并准备开发环境。\n');

  const envPath = path.join(process.cwd(), '.env.local');
  const examplePath = path.join(process.cwd(), '.env.example');

  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  发现已存的 .env.local，是否覆盖？(y/n) ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('❌ 已取消设置。');
      process.exit(0);
    }
  }

  // 获取配置
  console.log('\n--- 1. Notion 配置 ---');
  console.log('获取 Token: https://www.notion.so/my-integrations');
  const token = await question('请输入你的 NOTION_TOKEN (secret_...): ');
  
  console.log('\n获取 ID: 打开你的数据库页面，从 URL 提取。');
  const dbId = await question('请输入你的 NOTION_DATABASE_ID: ');

  console.log('\n--- 2. 网站基本配置 ---');
  const siteName = await question('网站名称 (默认: Notion Blog): ') || 'Notion Blog';
  const authorName = await question('作者名称 (默认: LingYi): ') || 'LingYi';

  // 生成内容
  const envContent = `# Notion API 配置
NOTION_TOKEN=${token}
NOTION_DATABASE_ID=${dbId}

# 网站配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=${siteName}
NEXT_PUBLIC_AUTHOR_NAME=${authorName}

# 如果你是在本地开发，以下 Vercel KV 和 Cloudflare 配置通常保持为空
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ 成功！.env.local 文件已生成。');
    
    console.log('\n--- 下一步建议 ---');
    console.log('1. 确保你的 Notion Integration 已连接到该数据库。');
    console.log('2. 运行 \x1b[36mnpm run dev\x1b[0m 启动开发服务器。');
    console.log('3. 详细文档请参考 \x1b[32mREADME.md\x1b[0m\n');
  } catch (err) {
    console.error('\n❌ 写入文件时出错:', err.message);
  }

  rl.close();
}

setup().catch(err => {
  console.error(err);
  process.exit(1);
});
