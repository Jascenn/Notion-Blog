'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { NotionPost } from '@/lib/notion';
import type { OptimizedLocale } from '@/lib/optimized-i18n';
import { optimizedRoots } from '@/lib/optimized-i18n';
import styles from '@/app/preview/optimized/optimized.module.css';

function formatDate(date: string, locale: OptimizedLocale) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(date));
}

export default function OptimizedSearchClient({ posts, locale = 'zh' }: { posts: NotionPost[]; locale?: OptimizedLocale }) {
  const en = locale === 'en';
  const root = optimizedRoots[locale];
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const tagsParam = searchParams.get('tags') || '';
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    setQuery(queryParam);
    setSelectedTags(tagsParam.split(',').map((tag) => tag.trim()).filter(Boolean));
  }, [queryParam, tagsParam]);

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.tags.map((tag) => tag.name)))).sort(),
    [posts],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesQuery = !needle
        || post.title.toLowerCase().includes(needle)
        || post.excerpt.toLowerCase().includes(needle)
        || post.content.toLowerCase().includes(needle)
        || post.tags.some((tag) => tag.name.toLowerCase().includes(needle));
      const matchesTags = selectedTags.length === 0
        || selectedTags.some((selected) => post.tags.some((tag) => tag.name === selected));
      return matchesQuery && matchesTags;
    });
  }, [posts, query, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => current.includes(tag)
      ? current.filter((item) => item !== tag)
      : [...current, tag]);
  };

  const clear = () => {
    setQuery('');
    setSelectedTags([]);
  };

  return (
    <div className={styles.siteRoot}>
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.kicker}>{en ? 'SEARCH' : 'SEARCH / 搜索'}</span>
            <h1>{en ? <>Find the note{' '}<br />you are looking for.</> : <>从所有记录里，<br />找到那一篇。</>}</h1>
          </div>
          <p className={styles.pageIntro}>{en ? 'Search by topic, title, or keyword. You can also combine tags to narrow the results.' : '输入主题、标题或关键词，也可以直接组合标签筛选。'}</p>
        </header>

        <section className={styles.searchPanel} aria-label={en ? 'Search and filter' : '搜索与筛选'}>
          <div className={styles.searchInputWrap}>
            <input
              className={styles.searchInput}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={en ? 'Search articles, topics, or tags' : '搜索文章、主题或标签'}
              aria-label={en ? 'Search articles' : '搜索文章'}
            />
            <span className={styles.searchGlyph}>↘</span>
          </div>

          <div className={styles.tagFilters}>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`${styles.tagButton} ${selectedTags.includes(tag) ? styles.tagActive : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        <div className={styles.resultBar}>
          <span>{results.length} / {posts.length} {en ? 'articles' : '篇文章'}</span>
          {(query || selectedTags.length > 0) && (
            <button type="button" onClick={clear} className={styles.clearButton}>{en ? 'Clear filters' : '清除筛选'}</button>
          )}
        </div>

        {results.length > 0 ? (
          <section className={styles.archiveList} aria-label={en ? 'Search results' : '搜索结果'}>
            {results.map((post, index) => (
              <Link key={post.id} href={`${root}/${post.slug}`} className={styles.archiveRow}>
                <span className={styles.archiveNumber}>{String(index + 1).padStart(2, '0')}</span>
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
                <div className={styles.archiveCopy}>
                  <h2>{post.title}</h2>
                  {post.excerpt && <p>{post.excerpt}</p>}
                </div>
                <div className={styles.archiveTags}>
                  {post.tags.slice(0, 2).map((tag) => <span key={tag.name}>{tag.name}</span>)}
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <div className={styles.emptyState}>
            <p>{en ? 'No matching notes. Try a different keyword.' : '没有找到对应记录，换一个关键词试试。'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
