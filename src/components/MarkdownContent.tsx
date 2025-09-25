'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github.css';

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-gray max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // 自定义标题样式，添加 id 属性支持锚点跳转
          h1: ({ children }) => {
            const text = typeof children === 'string' ? children : '';
            const id = text
              .toLowerCase()
              .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/--+/g, '-')
              .trim();
            return (
              <h1 id={id} className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const text = typeof children === 'string' ? children : '';
            const id = text
              .toLowerCase()
              .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/--+/g, '-')
              .trim();
            return (
              <h2 id={id} className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = typeof children === 'string' ? children : '';
            const id = text
              .toLowerCase()
              .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/--+/g, '-')
              .trim();
            return (
              <h3 id={id} className="text-lg font-medium text-gray-900 mt-5 mb-2">
                {children}
              </h3>
            );
          },

          // 段落样式
          p: ({ children }) => (
            <p className="text-gray-700 leading-relaxed mb-4">
              {children}
            </p>
          ),

          // 链接样式
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-800 underline transition-colors"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),

          // 图片样式
          img: ({ src, alt }) => (
            <div className="my-6">
              <img
                src={src}
                alt={alt}
                className="w-full rounded-lg shadow-sm border border-gray-200"
                loading="lazy"
              />
              {alt && (
                <p className="text-sm text-gray-500 text-center mt-2 italic">
                  {alt}
                </p>
              )}
            </div>
          ),

          // 代码块样式
          pre: ({ children, ...props }) => {
            const [copied, setCopied] = React.useState(false);

            const copyToClipboard = async () => {
              try {
                // 提取纯文本代码内容
                const extractText = (element: any): string => {
                  if (typeof element === 'string') {
                    return element;
                  }
                  if (React.isValidElement(element)) {
                    if (element.props.children) {
                      if (Array.isArray(element.props.children)) {
                        return element.props.children.map(extractText).join('');
                      }
                      return extractText(element.props.children);
                    }
                  }
                  if (Array.isArray(element)) {
                    return element.map(extractText).join('');
                  }
                  return '';
                };

                const codeText = extractText(children);
                await navigator.clipboard.writeText(codeText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch (err) {
                console.error('复制失败:', err);
              }
            };

            return (
              <div className="relative group my-4">
                <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto border border-gray-200">
                  {children}
                </pre>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white hover:bg-gray-100 border border-gray-200 rounded-md p-1.5 text-gray-600 hover:text-gray-900 shadow-sm"
                  title={copied ? '已复制！' : '复制代码'}
                >
                  {copied ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            );
          },

          // 行内代码样式
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            ) : (
              <code className={className}>{children}</code>
            );
          },

          // 引用块样式
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 my-4 text-gray-600 italic">
              {children}
            </blockquote>
          ),

          // 列表样式
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-4 text-gray-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-4 text-gray-700">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),

          // 表格样式
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-gray-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-left font-medium text-gray-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-gray-200 px-4 py-2 text-gray-700">
              {children}
            </td>
          ),

          // 分隔线样式
          hr: () => (
            <hr className="border-t border-gray-200 my-8" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}