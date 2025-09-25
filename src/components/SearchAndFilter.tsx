'use client';

import { useState, useEffect } from 'react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  slug: string;
  tags: string[];
  cover: string | null;
}

interface SearchAndFilterProps {
  posts: BlogPost[];
  onFilterChange: (filteredPosts: BlogPost[]) => void;
  externalSelectedTags?: string[];
  onTagSelectionChange?: (tags: string[]) => void;
}

export default function SearchAndFilter({
  posts,
  onFilterChange,
  externalSelectedTags,
  onTagSelectionChange
}: SearchAndFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(externalSelectedTags || []);

  // 获取所有唯一的标签
  const allTags = Array.from(
    new Set(posts.flatMap(post => post.tags))
  ).sort();

  // 筛选逻辑
  useEffect(() => {
    let filtered = posts;

    // 按搜索词筛选
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 按标签筛选
    if (selectedTags.length > 0) {
      filtered = filtered.filter(post =>
        selectedTags.some(tag => post.tags.includes(tag))
      );
    }

    onFilterChange(filtered);
  }, [searchTerm, selectedTags, posts, onFilterChange]);

  // 同步外部标签选择
  useEffect(() => {
    if (externalSelectedTags) {
      setSelectedTags(externalSelectedTags);
    }
  }, [externalSelectedTags]);

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newTags);
    onTagSelectionChange?.(newTags);
  };

  return (
    <div className="space-y-5">
      {/* 搜索框 */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 text-base border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      {/* 标签筛选 - 更简洁的显示 */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-3 text-sm">
          {allTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`transition-colors ${
                selectedTags.includes(tag)
                  ? 'text-gray-900 underline'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* 清除筛选 */}
      {(searchTerm || selectedTags.length > 0) && (
        <div>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedTags([]);
            }}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}