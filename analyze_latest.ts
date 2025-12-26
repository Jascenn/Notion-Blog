import { getPostsList, getPageMarkdown } from './src/lib/notion/client.ts';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function analyze() {
    const posts = await getPostsList();
    if (posts.length === 0) {
        console.log('No posts found');
        return;
    }
    const latest = posts[0];
    console.log(`Latest Post: ${latest.title}`);

    const content = await getPageMarkdown(latest.id);
    console.log('--- Content Preview ---');
    console.log(content.slice(0, 1000));
}

analyze().catch(console.error);
