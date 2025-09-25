// 简单测试 Notion 连接
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('环境变量测试:');
console.log('NOTION_TOKEN:', process.env.NOTION_TOKEN ? '✅ 已设置' : '❌ 未设置');
console.log('NOTION_DATABASE_ID:', process.env.NOTION_DATABASE_ID ? '✅ 已设置' : '❌ 未设置');

// 测试基本的 fetch 请求
async function testNotionAPI() {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) {
    console.error('❌ 缺少必要的环境变量');
    return;
  }

  try {
    console.log('\n🔄 测试 Notion API...');

    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ HTTP ${response.status}:`, errorData);

      if (response.status === 401) {
        console.log('\n🔑 权限问题解决方案:');
        console.log('1. 检查 Integration Token 是否正确');
        console.log('2. 确认在 Notion 中邀请了 Integration');
      }

      if (response.status === 404) {
        console.log('\n📋 Database 不存在解决方案:');
        console.log('1. 确认 Database ID 是否正确');
        console.log('2. 确认 Database 存在且可访问');
      }

      return;
    }

    const data = await response.json();
    console.log(`✅ 成功连接！找到 ${data.results.length} 条记录`);

    data.results.forEach((page, index) => {
      const title = page.properties.Title?.title?.[0]?.plain_text || '无标题';
      const published = page.properties.Published?.checkbox || false;
      console.log(`📄 记录 ${index + 1}: "${title}" - 发布状态: ${published ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('❌ 网络错误:', error.message);
  }
}

testNotionAPI();