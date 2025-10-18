import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseId = process.env.NOTION_DATABASE_ID;

console.log('🔍 测试 Notion API 连接...\n');
console.log('Token:', process.env.NOTION_TOKEN?.substring(0, 20) + '...');
console.log('Database ID:', databaseId);
console.log('');

try {
  console.log('📋 查询数据库...');
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      select: {
        equals: 'Published',
      },
    },
  });

  console.log(`✅ 查询成功！找到 ${response.results.length} 篇文章\n`);

  if (response.results.length === 0) {
    console.log('⚠️  没有找到 Status=Published 的文章');
    console.log('\n尝试查询所有文章...');

    const allResponse = await notion.databases.query({
      database_id: databaseId,
    });

    console.log(`找到 ${allResponse.results.length} 篇文章（所有状态）\n`);

    allResponse.results.forEach((page, index) => {
      const title = page.properties.Title?.title?.[0]?.plain_text || '无标题';
      const status = page.properties.Status?.select?.name || '无状态';
      const type = page.properties.Type?.select?.name || '无类型';

      console.log(`${index + 1}. ${title}`);
      console.log(`   Status: ${status}`);
      console.log(`   Type: ${type}`);
      console.log(`   Properties: ${Object.keys(page.properties).join(', ')}`);
      console.log('');
    });
  } else {
    response.results.forEach((page, index) => {
      const title = page.properties.Title?.title?.[0]?.plain_text || '无标题';
      const slug = page.properties.Slug?.rich_text?.[0]?.plain_text || '无slug';
      const tags = page.properties.Tags?.multi_select?.map(t => t.name).join(', ') || '无标签';

      console.log(`${index + 1}. ${title}`);
      console.log(`   Slug: ${slug}`);
      console.log(`   Tags: ${tags}`);
      console.log('');
    });
  }
} catch (error) {
  console.error('❌ 错误:', error.message);
  console.error('错误代码:', error.code);

  if (error.code === 'unauthorized') {
    console.log('\n🔑 权限问题：');
    console.log('1. 检查 Integration Token 是否正确');
    console.log('2. 在 Notion 数据库页面，点击右上角"..."菜单');
    console.log('3. 选择 "Connections" → 添加你的 Integration');
  }
}
