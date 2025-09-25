'use client';

import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import BlogCard from '@/components/BlogCard';
import Link from 'next/link';
import { getPosts } from '@/lib/notion';
import type { NotionPost } from '@/lib/notion';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [posts, setPosts] = useState<NotionPost[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取文章数据
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 获取所有唯一标签
  const allTags = Array.from(
    new Set(posts.flatMap(post => post.tags))
  ).sort();

  // 过滤文章
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === '' ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(selectedTag => post.tags.includes(selectedTag));

    return matchesSearch && matchesTags;
  });

  // 标签点击处理
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 清除所有筛选
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Search Posts
        </h1>

        {/* 搜索框 - 横向拉满 */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="搜索文章、标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-200 dark:border-gray-700 rounded-none focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            autoFocus
          />
        </div>

        {/* 标签筛选 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">标签筛选</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 清除筛选按钮 */}
          {(searchTerm || selectedTags.length > 0) && (
            <button
              onClick={clearAllFilters}
              className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
            >
              清除所有筛选
            </button>
          )}
        </div>

        {/* 搜索结果统计 */}
        <div className="text-sm text-gray-500 mb-6">
          {loading ? (
            <>加载中...</>
          ) : searchTerm || selectedTags.length > 0 ? (
            <>找到 {filteredPosts.length} 篇相关文章</>
          ) : (
            <>共 {posts.length} 篇文章</>
          )}
          {selectedTags.length > 0 && (
            <span className="ml-2">
              (标签: {selectedTags.join(', ')})
            </span>
          )}
        </div>
      </div>

      {/* 搜索结果 */}
      <div className="pb-16">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-500">加载文章中...</p>
          </div>
        ) : filteredPosts.length === 0 && (searchTerm || selectedTags.length > 0) ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">
              没有找到符合条件的文章
            </p>
            <button
              onClick={clearAllFilters}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              清除所有筛选条件
            </button>
          </div>
        ) : (
          <div>
            {filteredPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                publishedAtStr={formatDate(post.publishedAt)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 返回首页链接 */}
      <div className="border-t border-gray-200 pt-8">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}