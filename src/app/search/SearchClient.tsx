'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import BlogCard from '@/components/BlogCard';
import Link from 'next/link';
import type { NotionPost } from '@/lib/notion';

interface SearchClientProps {
  initialPosts: NotionPost[];
}


export default function SearchClient({ initialPosts }: SearchClientProps) {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [posts] = useState(initialPosts);

  // 从 URL 预填搜索与标签
  useEffect(() => {
    if (!searchParams) return;
    const q = searchParams.get('q') || '';
    const tagsParam = searchParams.get('tags') || '';
    const tags = tagsParam
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    setSearchTerm(q);
    setSelectedTags(tags);
  }, [searchParams]);

  const allTags = useMemo(() => {
    return Array.from(new Set(posts.flatMap(post => post.tags.map(t => t.name)))).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase();

    return posts.filter(post => {
      const matchesSearch = lowerTerm === '' ||
        post.title.toLowerCase().includes(lowerTerm) ||
        (post.excerpt || '').toLowerCase().includes(lowerTerm) ||
        post.tags.some(tag => tag.name.toLowerCase().includes(lowerTerm));

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(selectedTag => post.tags.some(t => t.name === selectedTag));

      return matchesSearch && matchesTags;
    });
  }, [posts, searchTerm, selectedTags]);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          搜索文章
        </h1>

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

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">标签筛选</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${selectedTags.includes(tag)
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {(searchTerm || selectedTags.length > 0) && (
            <button
              onClick={clearAllFilters}
              className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
            >
              清除所有筛选
            </button>
          )}
        </div>

        <div className="text-sm text-gray-500 mb-6">
          {searchTerm || selectedTags.length > 0
            ? <>找到 {filteredPosts.length} 篇相关文章</>
            : <>共 {posts.length} 篇文章</>}
          {selectedTags.length > 0 && (
            <span className="ml-2">(标签: {selectedTags.join(', ')})</span>
          )}
        </div>
      </div>

      <div className="pb-16">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">没有找到符合条件的文章</p>
            <button
              onClick={clearAllFilters}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              清除所有筛选条件
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-8">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
