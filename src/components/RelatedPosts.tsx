import Link from 'next/link';
import type { NotionPost } from '@/lib/notion';

interface RelatedPostsProps {
  currentPost: NotionPost;
  allPosts: NotionPost[];
  maxPosts?: number;
}

export default function RelatedPosts({ currentPost, allPosts, maxPosts = 3 }: RelatedPostsProps) {
  // 计算文章相关度
  const calculateRelatedness = (post: NotionPost): number => {
    let score = 0;

    // 标签匹配度（权重最高）
    const tagNames = post.tags.map(t => t.name);
    const currentTagNames = currentPost.tags.map(t => t.name);
    const tagMatches = tagNames.filter(tag => currentTagNames.includes(tag)).length;
    score += tagMatches * 3;

    // 标题关键词匹配
    const currentTitleWords = currentPost.title.toLowerCase().split(/\s+/);
    const postTitleWords = post.title.toLowerCase().split(/\s+/);
    const titleMatches = currentTitleWords.filter(word =>
      word.length > 2 && postTitleWords.includes(word)
    ).length;
    score += titleMatches * 2;

    // 摘要关键词匹配
    const currentExcerptWords = currentPost.excerpt.toLowerCase().split(/\s+/);
    const postExcerptWords = post.excerpt.toLowerCase().split(/\s+/);
    const excerptMatches = currentExcerptWords.filter(word =>
      word.length > 3 && postExcerptWords.includes(word)
    ).length;
    score += excerptMatches * 1;

    // 时间距离加成（时间越近，分数略高）
    const timeDiff = Math.abs(
      new Date(currentPost.publishedAt).getTime() - new Date(post.publishedAt).getTime()
    );
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    if (daysDiff < 30) score += 1;

    return score;
  };

  // 获取相关文章
  const relatedPosts = allPosts
    .filter(post => post.id !== currentPost.id) // 排除当前文章
    .map(post => ({
      post,
      score: calculateRelatedness(post)
    }))
    .filter(item => item.score > 0) // 只保留有相关性的文章
    .sort((a, b) => b.score - a.score) // 按相关度降序
    .slice(0, maxPosts) // 限制数量
    .map(item => item.post);

  if (relatedPosts.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
        相关文章
      </h3>
      <div className="space-y-6">
        {relatedPosts.map((post) => (
          <article key={post.id} className="group">
            <Link href={`/${post.slug}`} className="block space-y-2">
              <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                {post.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                <time>{formatDate(post.publishedAt)}</time>
                {post.tags.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex space-x-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag.name} className={`px-1.5 py-0.5 rounded text-xs notion-tag-${tag.color}`}>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}