// 测试 Notion 连接的简单脚本
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

// 从环境变量读取配置
dotenv.config({ path: '.env.local' });

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseId = process.env.NOTION_DATABASE_ID;

async function testNotionConnection() {
  console.log('🔄 测试 Notion 连接...');
  console.log('Token:', process.env.NOTION_TOKEN ? '✅ 已设置' : '❌ 未设置');
  console.log('Database ID:', process.env.NOTION_DATABASE_ID ? '✅ 已设置' : '❌ 未设置');

  try {
    console.log('\n📋 尝试查询 Database...');
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    console.log(`✅ 成功！找到 ${response.results.length} 条记录`);

    // 显示每条记录的基本信息
    response.results.forEach((page, index) => {
      console.log(`\n📄 记录 ${index + 1}:`);
      console.log('- ID:', page.id);
      console.log('- Title:', page.properties.Title?.title?.[0]?.plain_text || '无标题');
      console.log('- Published:', page.properties.Published?.checkbox || false);
      console.log('- Properties:', Object.keys(page.properties));
    });

  } catch (error) {
    console.error('❌ 错误:', error.message);

    if (error.code === 'unauthorized') {
      console.log('\n🔑 权限问题解决方案:');
      console.log('1. 确认 Integration Token 正确');
      console.log('2. 在 Notion Database 中点击 "Share"');
      console.log('3. 添加你的 Integration');
      console.log('4. 给予 "Full access" 权限');
    }

    if (error.code === 'object_not_found') {
      console.log('\n📋 Database 不存在解决方案:');
      console.log('1. 确认 Database ID 正确');
      console.log('2. 确认 Database 存在且可访问');
    }
  }
}

testNotionConnection();