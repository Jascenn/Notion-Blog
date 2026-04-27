import fs from 'fs';
import path from 'path';

async function check() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('❌ 未找到 .env.local 文件。请运行 npm run setup');
        process.exit(1);
    }

    const content = fs.readFileSync(envPath, 'utf8');
    const required = ['NOTION_TOKEN', 'NOTION_DATABASE_ID', 'NEXT_PUBLIC_SITE_URL'];
    let missing = [];

    required.forEach(key => {
        if (!content.includes(`${key}=`) || content.includes(`${key}=your_`)) {
            missing.push(key);
        }
    });

    if (missing.length > 0) {
        console.warn('⚠️  以下配置项似乎不完整或使用了默认值:');
        missing.forEach(m => console.log(`   - ${m}`));
        process.exit(1);
    }

    console.log('✅ 配置校验通过！');
}

check().catch(console.error);
