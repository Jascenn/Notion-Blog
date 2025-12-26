'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import dynamic from 'next/dynamic';
import NotionImage from './NotionImage';
import { logger } from '@/lib/logger';
import 'highlight.js/styles/github.css';
import { slugifyHeading } from '@/lib/slugifyHeading';

// 动态导入数学公式组件，避免 SSR 问题
const MathFormula = dynamic(() => import('./MathFormula'), {
  ssr: false,
  loading: () => <span className="text-gray-400">加载公式...</span>
});

// 计算列表嵌套深度的辅助函数
function getListDepth(node: MarkdownNode | null | undefined): number {
  if (!node) return 1;

  let depth = 1;
  let parent = node.parent;

  while (parent) {
    if (parent.type === 'element' && (parent.tagName === 'ul' || parent.tagName === 'ol')) {
      depth++;
    }
    parent = parent.parent;
  }

  return depth;
}

interface MarkdownContentProps {
  content: string;
}

interface MarkdownNode {
  type?: string;
  tagName?: string;
  parent?: MarkdownNode | null;
  properties?: Record<string, unknown>;
}

const getTextFromChildren = (children: React.ReactNode): string => {
  return React.Children.toArray(children)
    .map(child => (typeof child === 'string' ? child : ''))
    .join('');
};

// 判断是否为无意义的文件名(包括常见的默认文件名)
const isMeaninglessFilename = (text: string): boolean => {
  if (!text || !text.trim()) return true;

  const trimmed = text.trim().toLowerCase();

  // 常见的无意义文件名
  const meaninglessNames = [
    'image', 'img', 'photo', 'picture', 'pic',
    'file', 'untitled', 'screenshot',
    '屏幕截图', '截图', '图片', '照片'
  ];

  // 如果是常见的无意义文件名,返回 true
  if (meaninglessNames.includes(trimmed)) {
    return true;
  }

  // 如果只是纯数字或很短的无意义字符,也过滤
  if (/^[\d\-_\s]+$/.test(trimmed) || trimmed.length < 2) {
    return true;
  }

  return false;
};

// 移除文件扩展名
const removeFileExtension = (text: string): string => {
  if (!text || !text.trim()) return text;

  const trimmed = text.trim();

  // 移除常见的文件扩展名
  const extensionPattern = /\.(png|jpg|jpeg|gif|webp|svg|bmp|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|mp4|avi|mov|mp3|wav)$/i;

  return trimmed.replace(extensionPattern, '');
};

// 图片组件，支持错误处理和加载状态
const ImageComponent: React.FC<{ src: string; alt?: string }> = ({ src, alt }) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);
  const [isZoomed, setIsZoomed] = React.useState(false);

  // 处理 alt 文本:先移除扩展名,然后判断是否为无意义文件名
  const displayAlt = alt ? removeFileExtension(alt) : '';
  const shouldShowAlt = displayAlt && displayAlt.trim() && !isMeaninglessFilename(displayAlt);

  // 监听 ESC 键关闭放大模式
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
      }
    };

    if (isZoomed) {
      document.addEventListener('keydown', handleKeyDown);
      // 防止页面滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isZoomed]);

  if (imageError) {
    return (
      <div className="my-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
        <div className="text-gray-400 text-4xl mb-2">📷</div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          图片加载失败
        </p>
        <p className="text-xs text-gray-400 mt-1 break-all">
          {src}
        </p>
        {shouldShowAlt && (
          <p className="text-xs text-gray-400 mt-1 font-medium">{displayAlt}</p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="my-6 select-none flex flex-col items-center">
        <div className="relative w-full h-auto group bg-gray-50 dark:bg-gray-900/50 rounded-xl overflow-hidden border border-black/5 dark:border-white/10">
          {imageLoading && (
            <div className="flex items-center justify-center h-48">
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                <span className="text-sm">加载中...</span>
              </div>
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || ''}
            className={`w-full h-auto rounded-xl shadow-sm transition-all duration-300 cursor-zoom-in ${imageLoading ? 'opacity-0 absolute' : 'opacity-100'}`}
            style={{ objectFit: 'contain', maxHeight: '85vh' }}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            onClick={() => setIsZoomed(true)}
            title={shouldShowAlt ? displayAlt : undefined}
          />
          {!imageLoading && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                <span>🔍</span> 点击放大
              </div>
            </div>
          )}
        </div>
        {shouldShowAlt && !imageLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 italic">
            {displayAlt}
          </p>
        )}
      </div>

      {/* 放大模态框 - 仅修复遮挡逻辑，保持原始极简 UI */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative flex flex-col items-center justify-center max-w-full max-h-full group"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 图片本身 */}
            <div className="flex-1 min-h-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt || '图片预览'}
                className="max-w-[95vw] max-h-[85vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
              />
            </div>

            {/* 极简功能按钮组 - 悬停显示 */}
            <div className="absolute top-4 right-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200 z-[60]">
              {/* 查看原图按钮 - 极致简洁纯文字版 */}
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black/50 text-white h-8 px-4 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors text-xs font-medium"
                onClick={(e) => e.stopPropagation()}
                title="查看原图"
              >
                <span>原图</span>
              </a>

              {/* 原始极简关闭按钮 */}
              <button
                className="bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                onClick={() => setIsZoomed(false)}
                title="关闭"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            {/* 标题 - 仅调整为自然排列在下方，防止遮挡 */}
            {shouldShowAlt && (
              <div className="mt-4 bg-black/50 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm pointer-events-none">
                {displayAlt}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// 代码块组件，支持复制功能
const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      // 提取纯文本代码内容
      const extractText = (element: React.ReactNode): string => {
        if (typeof element === 'string') {
          return element;
        }
        if (React.isValidElement(element)) {
          const props = element.props as { children?: React.ReactNode };
          if (props.children) {
            if (Array.isArray(props.children)) {
              return props.children.map(extractText).join('');
            }
            return extractText(props.children);
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
      logger.error('复制失败', err);
    }
  };

  return (
    <div className="relative group my-4">
      <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto border border-gray-200">
        {children}
      </pre>
      <button
        type="button"
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
};

const getDomainFromUrl = (url: string): string => {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch (error) {
    logger.debug('解析域名失败', error);
    return '';
  }
};

const getFileExtension = (input: string): string => {
  const cleaned = input.split('?')[0];
  const match = cleaned.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : '';
};

const buildOfficeViewerUrl = (url: string) => `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

const isYouTube = (url: string): boolean => /youtube\.com|youtu\.be/.test(url);
const getYouTubeEmbedUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }
    const videoId = parsed.searchParams.get('v');
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  } catch (error) {
    logger.debug('解析 YouTube 链接失败', error);
    return url;
  }
};

const ALLOWED_EMBED_HOSTS = new Set([
  'codepen.io',
  'codesandbox.io',
  'figma.com',
  'jsfiddle.net',
  'loom.com',
  'player.bilibili.com',
  'bilibili.com',
  'notion.so',
  'stackblitz.com',
  'tldraw.com',
  'vercel.app',
  'whimsical.com',
]);

interface NotionEmbedProps {
  type?: string;
  url?: string;
  caption?: string;
  videoType?: string;
  name?: string;
}

const NotionEmbed: React.FC<NotionEmbedProps> = ({ type = '', url = '', caption, videoType, name }) => {
  if (!url) {
    return null;
  }

  const domain = getDomainFromUrl(url);
  const captionText = caption?.trim();

  const renderVideo = () => {
    if (videoType === 'file') {
      const fileName = captionText || url.split('/').pop() || '视频文件';
      const fileExtension = url.split('.').pop()?.split('?')[0]?.toUpperCase() || 'VIDEO';

      return (
        <div className="notion-video-player">
          <div className="notion-video-header">
            <div className="notion-video-icon">🎬</div>
            <div className="notion-video-info">
              <h4 className="notion-video-title">{fileName}</h4>
              <p className="notion-video-format">{fileExtension} 视频文件</p>
            </div>
          </div>
          <video
            controls
            className="notion-video-controls"
            preload="metadata"
            poster=""
          >
            <source src={url} />
            您的浏览器不支持视频播放，请访问 <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">原链接</a>
          </video>
        </div>
      );
    }

    if (isYouTube(url)) {
      return (
        <iframe
          src={getYouTubeEmbedUrl(url)}
          className="w-full aspect-video rounded-xl border border-gray-200"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    return (
      <div className="notion-embed-fallback">
        <div className="notion-embed-fallback-icon">▶</div>
        <div className="notion-embed-fallback-meta">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">视频内容</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{domain || url}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="notion-embed-fallback-button"
        >
          播放
        </a>
      </div>
    );
  };

  const renderFile = () => {
    // 先从name属性获取扩展名，如果没有再从URL获取
    const fileName = name || '';
    const urlExtension = getFileExtension(url);
    const nameExtension = getFileExtension(fileName);
    const extension = nameExtension || urlExtension;

    if (extension === 'pdf') {
      return (
        <iframe
          src={url}
          className="w-full h-96 border border-gray-200 rounded-xl"
          title={fileName || 'PDF 预览'}
        />
      );
    }

    if (extension === 'ppt' || extension === 'pptx') {
      return (
        <iframe
          src={buildOfficeViewerUrl(url)}
          className="w-full h-96 border border-gray-200 rounded-xl"
          title={fileName || 'PPT 预览'}
        />
      );
    }

    // 根据文件扩展名确定文件类型和图标
    const getFileTypeAndIcon = (ext: string) => {
      switch (ext.toLowerCase()) {
        case 'pdf':
          return { icon: '📄', type: 'PDF 文档', color: '#dc2626' };
        case 'doc':
        case 'docx':
          return { icon: '📝', type: 'Word 文档', color: '#2563eb' };
        case 'xls':
        case 'xlsx':
          return { icon: '📊', type: 'Excel 表格', color: '#16a34a' };
        case 'ppt':
        case 'pptx':
          return { icon: '📈', type: 'PowerPoint 演示', color: '#ea580c' };
        case 'zip':
        case 'rar':
        case '7z':
          return { icon: '🗜️', type: '压缩文件', color: '#7c3aed' };
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
          return { icon: '🖼️', type: '图片文件', color: '#db2777' };
        case 'mp3':
        case 'wav':
        case 'flac':
          return { icon: '🎵', type: '音频文件', color: '#059669' };
        case 'mp4':
        case 'avi':
        case 'mov':
          return { icon: '🎬', type: '视频文件', color: '#dc2626' };
        case 'txt':
        case 'md':
          return { icon: '📃', type: '文本文件', color: '#374151' };
        case 'json':
        case 'js':
        case 'ts':
        case 'html':
        case 'css':
          return { icon: '💻', type: '代码文件', color: '#1f2937' };
        default:
          return { icon: '📄', type: '文件', color: '#6b7280' };
      }
    };

    const displayName = fileName || '未知文件';
    const { icon, type, color } = getFileTypeAndIcon(extension);

    return (
      <div className="notion-embed-file">
        <div className="notion-embed-file-icon" style={{ color }}>
          {icon}
        </div>
        <div className="notion-embed-file-info">
          <p className="notion-embed-file-name">{displayName}</p>
          <p className="notion-embed-file-type">{type}</p>
          {domain && <p className="notion-embed-file-source">{domain}</p>}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="notion-embed-file-button"
          download
        >
          <span className="notion-embed-file-button-icon">⬇️</span>
          下载
        </a>
      </div>
    );
  };

  const renderImage = () => {
    return <ImageComponent src={url} alt={captionText || '图片'} />;
  };

  const renderAudio = () => {
    // 检测音频平台
    if (url?.includes('spotify.com')) {
      return (
        <div className="audio-container spotify-audio">
          <iframe
            src={url.replace('open.spotify.com/track/', 'open.spotify.com/embed/track/')}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      );
    }

    if (url?.includes('soundcloud.com')) {
      return (
        <div className="audio-container">
          <iframe
            width="100%"
            height="166"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`}
          />
        </div>
      );
    }

    // 直接音频文件 - 优化版
    if (url?.match(/\.(mp3|wav|ogg|m4a|flac|aac)(\?.*)?$/i)) {
      const fileName = captionText || url.split('/').pop() || '音频文件';
      const fileExtension = url.split('.').pop()?.split('?')[0]?.toUpperCase() || 'AUDIO';

      return (
        <div className="notion-audio-player">
          <div className="notion-audio-header">
            <div className="notion-audio-icon">🎵</div>
            <div className="notion-audio-info">
              <h4 className="notion-audio-title">{fileName}</h4>
              <p className="notion-audio-format">{fileExtension} 音频文件</p>
            </div>
          </div>
          <audio controls className="notion-audio-controls" preload="metadata">
            <source src={url} />
            您的浏览器不支持音频播放，请访问 <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">原链接</a>
          </audio>
        </div>
      );
    }

    // 回退到音频链接卡片
    return (
      <div className="audio-link">
        <div className="audio-preview">
          <div className="audio-icon">🎵</div>
          <div className="audio-info">
            <p className="audio-title">{captionText || '音频内容'}</p>
            <p className="audio-url">{domain || url}</p>
          </div>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="audio-button"
        >
          播放
        </a>
      </div>
    );
  };

  const renderBookmark = () => {
    // 检测平台类型并设置对应图标和样式
    let icon = '🔖';
    let platformClass = '';

    if (url?.includes('spotify.com')) {
      icon = '🎵';
      platformClass = 'spotify-bookmark';
    } else if (url?.includes('youtube.com') || url?.includes('youtu.be')) {
      icon = '📺';
      platformClass = 'youtube-bookmark';
    } else if (url?.includes('github.com')) {
      icon = '📂';
      platformClass = 'github-bookmark';
    } else if (url?.includes('twitter.com') || url?.includes('x.com')) {
      icon = '🐦';
      platformClass = 'twitter-bookmark';
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`notion-embed-bookmark ${platformClass}`}
      >
        <div className="notion-embed-bookmark-icon">{icon}</div>
        <div className="notion-embed-bookmark-body">
          <p className="notion-embed-bookmark-title">{captionText || domain || url}</p>
          <p className="notion-embed-bookmark-url">{domain || url}</p>
        </div>
        <div className="notion-embed-bookmark-action">
          <span className="notion-embed-bookmark-button">访问</span>
        </div>
      </a>
    );
  };

  const renderGenericEmbed = () => {
    const host = getDomainFromUrl(url);
    if (host && ALLOWED_EMBED_HOSTS.has(host)) {
      return (
        <iframe
          src={url}
          className="w-full aspect-video rounded-xl border border-gray-200"
          allowFullScreen
        />
      );
    }

    return (
      <div className="notion-embed-fallback">
        <div className="notion-embed-fallback-icon">🔗</div>
        <div className="notion-embed-fallback-meta">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">嵌入内容</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{domain || url}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="notion-embed-fallback-button"
        >
          打开
        </a>
      </div>
    );
  };

  let preview: React.ReactNode = null;

  // image 和 bookmark 直接返回，不需要额外容器
  if (type === 'image') {
    return renderImage();
  }

  if (type === 'bookmark') {
    return renderBookmark();
  }

  switch (type) {
    case 'image':
      preview = renderImage();
      break;
    case 'video':
      preview = renderVideo();
      break;
    case 'audio':
      preview = renderAudio();
      break;
    case 'file':
      preview = renderFile();
      break;
    case 'embed':
      preview = renderGenericEmbed();
      break;
    default:
      preview = renderGenericEmbed();
      break;
  }

  return (
    <div className="notion-embed-card">
      <div className="notion-embed-preview">{preview}</div>
      <div className="notion-embed-foot">
        {captionText ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">{captionText}</p>
        ) : (
          domain && <p className="text-xs text-gray-400 dark:text-gray-500">{domain}</p>
        )}
      </div>
    </div>
  );
};

export default function MarkdownContent({ content }: MarkdownContentProps) {
  // 清理可能存在的孤立 HTML 标签
  const cleanedContent = React.useMemo(() => {
    if (!content) return content;

    let cleaned = content;

    // 移除孤立的 </div> 标签
    cleaned = cleaned.replace(/^\s*<\/div>\s*$/gm, '');
    cleaned = cleaned.replace(/(<\/div>)\s*(?=\n|$)/g, '$1');

    // 调试信息
    if (process.env.NODE_ENV === 'development') {
      const openDivs = (cleaned.match(/<div[^>]*>/g) || []).length;
      const closeDivs = (cleaned.match(/<\/div>/g) || []).length;

      if (openDivs !== closeDivs) {
        console.warn(`HTML div tags mismatch: ${openDivs} open divs vs ${closeDivs} close divs`);
      }
    }

    return cleaned;
  }, [content]);

  return (
    <div className="prose prose-gray max-w-none tracking-wide">
      <style jsx global>{`
        /* 强制覆盖 prose 的默认段落间距，使其更紧凑但保持呼吸感 */
        .prose p {
          margin-bottom: 0.8em !important;
          margin-top: 0 !important;
          line-height: 1.75 !important;
          text-align: justify;
        }
        
        /* 针对列表项的间距优化 */
        .prose ul, .prose ol {
          margin-top: 0.5em !important;
          margin-bottom: 0.5em !important;
        }
        .prose li {
          margin-top: 0.3em !important;
          margin-bottom: 0.3em !important;
          line-height: 1.75 !important;
        }
        
        /* 修正空行的大间距问题 */
        .prose p:has(br), .prose p:empty {
          margin-bottom: 0 !important;
          line-height: 1 !important;
          min-height: 1em;
        }

        /* Notion 颜色支持 */
        .text-red { color: #e03e3e !important; }
        .text-orange { color: #fd8200 !important; }
        .text-yellow { color: #dfab01 !important; }
        .text-green { color: #0e6e6e !important; }
        .text-blue { color: #1e6b99 !important; }
        .text-purple { color: #6b46c1 !important; }
        .text-brown { color: #a97153 !important; }
        .text-gray { color: #6b7280 !important; }

        /* Notion 背景色支持 */
        .bg-red { background-color: #ffeaea !important; padding: 2px 4px; border-radius: 3px; }
        .bg-orange { background-color: #ffefd5 !important; padding: 2px 4px; border-radius: 3px; }
        .bg-yellow { background-color: #fefce8 !important; padding: 2px 4px; border-radius: 3px; }
        .bg-green { background-color: #dcfce7 !important; padding: 2px 4px; border-radius: 3px; }
        .bg-blue { background-color: #dbeafe !important; padding: 2px 4px; border-radius: 3px; }
        .bg-purple { background-color: #ede9fe !important; padding: 2px 4px; border-radius: 3px; }
        .bg-brown { background-color: #fef3e2 !important; padding: 2px 4px; border-radius: 3px; }
        .bg-gray { background-color: #f5f5f5 !important; padding: 2px 4px; border-radius: 3px; }

        /* 深色模式适配 */
        .dark .text-red { color: #ff6b6b !important; }
        .dark .text-orange { color: #ff8e3c !important; }
        .dark .text-yellow { color: #ffd43b !important; }
        .dark .text-green { color: #51cf66 !important; }
        .dark .text-blue { color: #74c0fc !important; }
        .dark .text-purple { color: #b197fc !important; }
        .dark .text-brown { color: #d0bfff !important; }
        .dark .text-gray { color: #adb5bd !important; }

        .dark .bg-red { background-color: rgba(224, 62, 62, 0.2) !important; }
        .dark .bg-orange { background-color: rgba(253, 130, 0, 0.2) !important; }
        .dark .bg-yellow { background-color: rgba(223, 171, 1, 0.2) !important; }
        .dark .bg-green { background-color: rgba(14, 110, 110, 0.2) !important; }
        .dark .bg-blue { background-color: rgba(30, 107, 153, 0.2) !important; }
        .dark .bg-purple { background-color: rgba(107, 70, 193, 0.2) !important; }
        .dark .bg-brown { background-color: rgba(169, 113, 83, 0.2) !important; }
        .dark .bg-gray { background-color: rgba(107, 114, 128, 0.2) !important; }

        /* Column 分栏布局样式 */
        .notion-column-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 2rem;
          margin: 1rem 0;
        }
        .notion-column {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        /* 列内元素极简间距 */
        .notion-column p {
          margin-bottom: 0.25rem !important;
          line-height: 1.4 !important;
        }
        .notion-column .notion-list {
          margin: 0.25rem 0 !important;
        }
        .notion-column .notion-list-item {
          margin-bottom: 0.125rem !important;
          line-height: 1.3 !important;
        }
        .notion-column h1,
        .notion-column h2,
        .notion-column h3 {
          margin-bottom: 0.25rem !important;
          line-height: 1.2 !important;
        }

        @media (max-width: 768px) {
          .notion-column-list {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }

        /* Callout 卡片样式 */
        .notion-callout {
          display: flex;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.35);
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
          margin: 1.25rem 0;
        }
        .notion-callout-icon {
          font-size: 1.35rem;
          line-height: 1;
          flex-shrink: 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 0.15rem;
        }
        .notion-callout-emoji {
          font-size: 1.5rem;
        }
        .notion-callout-image img {
          width: 1.75rem;
          height: 1.75rem;
          object-fit: cover;
          border-radius: 8px;
        }
        .notion-callout-body {
          flex: 1;
          min-width: 0;
          line-height: 1.5;
          font-size: 0.95rem;
        }
        .notion-callout-body > * {
          margin: 0.35rem 0;
        }
        .notion-callout-body > *:first-child {
          margin-top: 0;
        }
        .notion-callout-body > *:last-child {
          margin-bottom: 0;
        }
        .notion-callout-body p {
          margin: 0.35rem 0;
        }
        .notion-callout-body ul,
        .notion-callout-body ol {
          margin: 0.35rem 0;
          padding-left: 1.5rem;
        }
        .notion-callout-body li {
          margin: 0.15rem 0;
        }
        .notion-callout-children {
          margin-top: 0.35rem;
          padding-top: 0.35rem;
          border-top: 1px solid rgba(148, 163, 184, 0.2);
        }

        .notion-callout[data-color='default'] { background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); }
        .notion-callout[data-color='gray_background'] { background: linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%); }
        .notion-callout[data-color='brown_background'] { background: linear-gradient(135deg, #f5f1eb 0%, #fffdfa 100%); }
        .notion-callout[data-color='orange_background'] { background: linear-gradient(135deg, #fff4e6 0%, #fff7ed 100%); }
        .notion-callout[data-color='yellow_background'] { background: linear-gradient(135deg, #fefce8 0%, #fffdf3 100%); }
        .notion-callout[data-color='green_background'] { background: linear-gradient(135deg, #ecfdf3 0%, #f5fff9 100%); }
        .notion-callout[data-color='blue_background'] { background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%); }
        .notion-callout[data-color='purple_background'] { background: linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%); }
        .notion-callout[data-color='pink_background'] { background: linear-gradient(135deg, #fdf2f8 0%, #fff5f8 100%); }
        .notion-callout[data-color='red_background'] { background: linear-gradient(135deg, #fee2e2 0%, #fff1f2 100%); }

        .dark .notion-callout {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
          border-color: rgba(148, 163, 184, 0.35);
          box-shadow: none;
        }
        .dark .notion-callout-children {
          border-color: rgba(148, 163, 184, 0.15);
        }
        .dark .notion-callout[data-color='blue_background'] { background: rgba(37, 99, 235, 0.22); }
        .dark .notion-callout[data-color='green_background'] { background: rgba(34, 197, 94, 0.18); }
        .dark .notion-callout[data-color='yellow_background'] { background: rgba(250, 204, 21, 0.18); }
        .dark .notion-callout[data-color='red_background'] { background: rgba(248, 113, 113, 0.2); }

        /* Toggle 折叠块样式 */
        details.notion-toggle {
          border: 1px solid rgba(203, 213, 225, 0.6);
          border-radius: 16px;
          background: rgba(248, 250, 252, 0.9);
          margin: 1.5rem 0;
          padding: 0.3rem 1rem 0.6rem;
        }
        details.notion-toggle > summary {
          list-style: none;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          color: #1f2937;
          padding: 0.6rem 0;
        }
        details.notion-toggle > summary::-webkit-details-marker {
          display: none;
        }
        details.notion-toggle > summary::before {
          content: '▶';
          font-size: 0.75rem;
          color: #94a3b8;
          transition: transform 0.2s ease;
        }
        details.notion-toggle[open] > summary::before {
          transform: rotate(90deg);
          color: #475569;
        }
        details.notion-toggle[data-depth='1'] { margin-left: 1.25rem; }
        details.notion-toggle[data-depth='2'] { margin-left: 2.5rem; }
        .notion-toggle-children {
          padding: 0.5rem 0 0 1.5rem;
          line-height: 1.6;
        }
        .dark details.notion-toggle {
          background: rgba(30, 41, 59, 0.6);
          border-color: rgba(148, 163, 184, 0.35);
        }
        .dark details.notion-toggle > summary { color: #e2e8f0; }
        .dark details.notion-toggle > summary::before { color: #94a3b8; }

        /* 表格样式 */
        .notion-table-wrapper {
          margin: 2rem 0;
          border-radius: 20px;
          overflow-x: auto;
          overflow-y: hidden;
          box-shadow: 0 24px 48px rgba(15, 23, 42, 0.08);
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }

        .notion-table-wrapper::-webkit-scrollbar {
          height: 8px;
        }

        .notion-table-wrapper::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }

        .notion-table-wrapper::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 10px;
        }

        .notion-table-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.8);
        }

        .notion-table {
          width: 100%;
          min-width: 480px;
          border-collapse: collapse;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          font-size: 0.95rem;
        }

        .notion-table th {
          background: #f1f5f9;
          font-weight: 600;
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          color: #1f2937;
          text-align: left;
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .notion-table td {
          padding: 0.8rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
          vertical-align: top;
          word-wrap: break-word;
          max-width: 200px;
        }

        .notion-table tbody tr:nth-child(odd) {
          background: #f8fafc;
        }

        .notion-table tbody tr:hover {
          background: #eef2ff;
          transition: background-color 0.2s ease;
        }

        /* 深色模式表格 */
        .dark .notion-table {
          background: rgba(15, 23, 42, 0.6);
        }

        .dark .notion-table th {
          background: rgba(51, 65, 85, 0.55);
          border-color: rgba(71, 85, 105, 0.6);
          color: #e2e8f0;
        }

        .dark .notion-table td {
          border-color: rgba(71, 85, 105, 0.5);
          color: #d1defc;
        }

        .dark .notion-table tbody tr:nth-child(odd) {
          background: rgba(30, 41, 59, 0.55);
        }

        .dark .notion-table tbody tr:hover {
          background: rgba(59, 130, 246, 0.22);
        }

        .dark .notion-table-wrapper::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .dark .notion-table-wrapper::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
        }

        .dark .notion-table-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.6);
        }

        /* 移动端表格优化 */
        @media (max-width: 768px) {
          .notion-table-wrapper {
            margin: 1.5rem -1rem;
            border-radius: 0;
            box-shadow: none;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
          }

          .dark .notion-table-wrapper {
            border-color: rgba(71, 85, 105, 0.5);
          }

          .notion-table {
            min-width: 600px;
            font-size: 0.875rem;
            border-radius: 0;
          }

          .notion-table th,
          .notion-table td {
            padding: 0.7rem 0.8rem;
            font-size: 0.875rem;
          }

          .notion-table th {
            font-size: 0.8rem;
            font-weight: 500;
          }

          .notion-table td {
            max-width: 150px;
          }
        }

        @media (max-width: 640px) {
          .notion-table {
            min-width: 500px;
            font-size: 0.8rem;
          }

          .notion-table th,
          .notion-table td {
            padding: 0.6rem 0.7rem;
            font-size: 0.8rem;
          }

          .notion-table td {
            max-width: 120px;
          }
        }

        /* 引用块 / Callout (notion-to-md 转换后) */
        blockquote.notion-quote {
          border-left: 4px solid rgba(148, 163, 184, 0.6);
          margin: 1.25rem 0;
          padding: 0.85rem 1rem;
          color: #475569;
          font-style: normal;
          background: rgba(248, 250, 252, 0.9);
          border-radius: 0 12px 12px 0;
        }
        blockquote.notion-quote p {
          margin: 0.35rem 0 !important;
          line-height: 1.5 !important;
        }
        blockquote.notion-quote p:first-child {
          margin-top: 0 !important;
        }
        blockquote.notion-quote p:last-child {
          margin-bottom: 0 !important;
        }
        .dark blockquote.notion-quote {
          background: rgba(30, 41, 59, 0.65);
          border-color: rgba(148, 163, 184, 0.4);
          color: #cbd5f5;
        }

        /* Embed 卡片样式 */
        .notion-embed-card {
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 18px;
          padding: 1rem 1.2rem;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          margin: 1.75rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          box-shadow: 0 22px 50px rgba(15, 23, 42, 0.08);
        }
        .dark .notion-embed-card {
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
          border-color: rgba(148, 163, 184, 0.25);
          box-shadow: none;
        }
        .notion-embed-preview iframe,
        .notion-embed-preview video {
          width: 100%;
          border: none;
          border-radius: 16px;
          background: #0f172a;
        }
        .notion-embed-file {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-radius: 16px;
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          border: 1px solid rgba(148, 163, 184, 0.25);
          margin: 1.5rem 0;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
        }

        .notion-embed-file:hover {
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
          border-color: rgba(148, 163, 184, 0.4);
        }

        .notion-embed-file-icon {
          font-size: 1.75rem;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(248, 250, 252, 0.6);
        }

        .notion-embed-file-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .notion-embed-file-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .notion-embed-file-type {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
          font-weight: 500;
        }

        .notion-embed-file-source {
          font-size: 0.75rem;
          color: #9ca3af;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .notion-embed-file-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          background: #1f2937;
          color: white;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          border-radius: 10px;
          transition: background 0.2s ease;
          flex-shrink: 0;
        }

        .notion-embed-file-button:hover {
          background: #111827;
          color: white;
        }

        .notion-embed-file-button-icon {
          font-size: 0.9rem;
        }

        /* 深色模式适配 */
        .dark .notion-embed-file {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
          border-color: rgba(148, 163, 184, 0.25);
        }

        .dark .notion-embed-file-name {
          color: #f9fafb;
        }

        .dark .notion-embed-file-type {
          color: #9ca3af;
        }

        .dark .notion-embed-file-source {
          color: #6b7280;
        }

        .dark .notion-embed-file-icon {
          background: rgba(55, 65, 81, 0.6);
        }

        .dark .notion-embed-file-button {
          background: #3b82f6;
        }

        .dark .notion-embed-file-button:hover {
          background: #2563eb;
        }

        /* 响应式设计 */
        @media (max-width: 640px) {
          .notion-embed-file {
            padding: 0.85rem 1rem;
            gap: 0.75rem;
          }

          .notion-embed-file-icon {
            width: 40px;
            height: 40px;
            font-size: 1.5rem;
          }

          .notion-embed-file-name {
            font-size: 0.9rem;
          }

          .notion-embed-file-type {
            font-size: 0.75rem;
          }

          .notion-embed-file-button {
            padding: 0.5rem 0.8rem;
            font-size: 0.8rem;
          }
        }
        .notion-embed-bookmark {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.25);
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          text-decoration: none;
          transition: all 0.2s ease;
          margin: 1.5rem 0;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
          min-height: 64px;
        }
        .notion-embed-bookmark:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.15);
          border-color: rgba(148, 163, 184, 0.4);
        }

        .notion-embed-bookmark-icon {
          font-size: 1.75rem;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(248, 250, 252, 0.6);
        }

        .notion-embed-bookmark-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .notion-embed-bookmark-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .notion-embed-bookmark-url {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .notion-embed-bookmark-action {
          flex-shrink: 0;
        }

        .notion-embed-bookmark-button {
          padding: 0.5rem 1rem;
          background: #1f2937;
          color: white;
          font-size: 0.8rem;
          font-weight: 500;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .notion-embed-bookmark:hover .notion-embed-bookmark-button {
          background: #111827;
        }

        /* 平台特色样式 */
        .spotify-bookmark .notion-embed-bookmark-icon {
          background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
          color: white;
        }

        .youtube-bookmark .notion-embed-bookmark-icon {
          background: linear-gradient(135deg, #ff0000 0%, #ff4444 100%);
          color: white;
        }

        .github-bookmark .notion-embed-bookmark-icon {
          background: linear-gradient(135deg, #24292e 0%, #586069 100%);
          color: white;
        }

        .twitter-bookmark .notion-embed-bookmark-icon {
          background: linear-gradient(135deg, #1da1f2 0%, #4dabf7 100%);
          color: white;
        }

        /* 深色模式适配 */
        .dark .notion-embed-bookmark {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
          border-color: rgba(148, 163, 184, 0.25);
        }

        .dark .notion-embed-bookmark-title {
          color: #f9fafb;
        }

        .dark .notion-embed-bookmark-url {
          color: #9ca3af;
        }

        .dark .notion-embed-bookmark-icon {
          background: rgba(55, 65, 81, 0.6);
        }

        .dark .notion-embed-bookmark-button {
          background: #3b82f6;
          color: white;
        }

        .dark .notion-embed-bookmark:hover .notion-embed-bookmark-button {
          background: #2563eb;
        }

        /* 响应式设计 */
        @media (max-width: 640px) {
          .notion-embed-bookmark {
            padding: 0.85rem 1rem;
            gap: 0.75rem;
          }

          .notion-embed-bookmark-icon {
            width: 40px;
            height: 40px;
            font-size: 1.5rem;
          }

          .notion-embed-bookmark-title {
            font-size: 0.9rem;
          }

          .notion-embed-bookmark-url {
            font-size: 0.75rem;
          }

          .notion-embed-bookmark-button {
            padding: 0.4rem 0.8rem;
            font-size: 0.75rem;
          }
        }
        .notion-embed-fallback {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 14px;
          border: 1px dashed rgba(148, 163, 184, 0.4);
          background: rgba(248, 250, 252, 0.65);
        }
        .notion-embed-fallback-icon { font-size: 1.25rem; }
        .notion-embed-fallback-button {
          padding: 0.35rem 0.9rem;
          border-radius: 999px;
          background: #1f2937;
          color: #f8fafc;
          font-size: 0.75rem;
          text-decoration: none;
          transition: background 0.2s ease;
        }
        .notion-embed-fallback-button:hover { background: #111827; }
        .notion-embed-foot { padding-top: 0.25rem; }
        .notion-embed-foot p { margin: 0; }
        .dark .notion-embed-fallback { background: rgba(30, 41, 59, 0.6); border-color: rgba(148, 163, 184, 0.35); }
        .dark .notion-embed-fallback-button { background: #38bdf8; color: #0f172a; }

        /* 视频样式 */
        .video-container {
          margin: 1.5rem 0;
          position: relative;
          width: 100%;
          padding-bottom: 56.25%; /* 16:9 宽高比 */
          height: 0;
          overflow: hidden;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 0.75rem;
        }
        .video-link {
          margin: 1.5rem 0;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        .video-link:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .video-preview {
          display: flex;
          align-items: center;
          padding: 1rem;
          gap: 1rem;
        }
        .video-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        .video-info {
          flex: 1;
          min-width: 0;
        }
        .video-title {
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
        }
        .video-url {
          color: #6b7280;
          font-size: 0.75rem;
          margin: 0;
          word-break: break-all;
        }
        .video-button {
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          flex-shrink: 0;
          transition: background 0.2s ease;
        }
        .video-button:hover {
          background: #2563eb;
          color: white;
        }

        /* 深色模式视频样式 */
        .dark .video-link {
          background: #1f2937;
          border-color: #374151;
        }
        .dark .video-title {
          color: #f9fafb;
        }
        .dark .video-url {
          color: #9ca3af;
        }

        /* 视频说明文字 */
        .video-caption {
          padding: 0.75rem;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          text-align: center;
          font-style: italic;
        }
        .dark .video-caption {
          background: #374151;
          border-color: #4b5563;
          color: #9ca3af;
        }

        /* 各平台特殊样式 */
        .youtube-video {
          border-color: #ff0000;
        }
        .vimeo-video {
          border-color: #1ab7ea;
        }
        .bilibili-video {
          border-color: #ff6699;
        }
        .tencent-video {
          border-color: #ff6600;
        }
        .youku-video {
          border-color: #06c755;
        }
        .twitch-video {
          border-color: #9146ff;
        }
        .dailymotion-video {
          border-color: #0066cc;
        }

        /* 平台链接特殊图标颜色 */
        .youtube-link .video-icon { color: #ff0000; }
        .vimeo-link .video-icon { color: #1ab7ea; }
        .bilibili-link .video-icon { color: #ff6699; }
        .tencent-link .video-icon { color: #ff6600; }
        .youku-link .video-icon { color: #06c755; }
        .twitch-link .video-icon { color: #9146ff; }
        .dailymotion-link .video-icon { color: #0066cc; }

        /* 嵌入和书签样式 */
        .embed-container {
          margin: 1.5rem 0;
          position: relative;
          width: 100%;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .embed-container iframe {
          width: 100%;
          height: auto;
          min-height: 300px;
          border: none;
        }
        .embed-caption {
          padding: 0.75rem;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }
        .embed-link {
          margin: 1.5rem 0;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        .embed-link:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        .embed-preview {
          display: flex;
          align-items: center;
          padding: 1rem;
          gap: 1rem;
        }
        .embed-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        .embed-info {
          flex: 1;
          min-width: 0;
        }
        .embed-title {
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
          line-height: 1.3;
        }
        .embed-url {
          color: #6b7280;
          font-size: 0.75rem;
          margin: 0;
          word-break: break-all;
        }
        .embed-button {
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          flex-shrink: 0;
          transition: background 0.2s ease;
        }
        .embed-button:hover {
          background: #2563eb;
          color: white;
        }

        /* Twitter 特殊样式 */
        .twitter-embed {
          border-color: #1da1f2;
        }
        .twitter-embed .embed-icon {
          color: #1da1f2;
        }
        .twitter-embed .embed-button {
          background: #1da1f2;
        }
        .twitter-embed .embed-button:hover {
          background: #1a91da;
        }

        /* 书签特殊样式 */
        .bookmark-link .embed-icon {
          color: #f59e0b;
        }

        /* 深色模式嵌入样式 */
        .dark .embed-container {
          box-shadow: none;
        }
        .dark .embed-caption {
          background: #374151;
          border-color: #4b5563;
          color: #9ca3af;
        }
        .dark .embed-link {
          background: #1f2937;
          border-color: #374151;
        }
        .dark .embed-title {
          color: #f9fafb;
        }
        .dark .embed-url {
          color: #9ca3af;
        }
        .dark .twitter-embed {
          border-color: #1da1f2;
        }

        /* 音频样式 */
        .audio-container {
          margin: 1.5rem 0;
          position: relative;
          width: 100%;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .audio-container audio {
          width: 100%;
          height: 54px;
          background: #f9fafb;
          border-radius: 0.5rem;
        }
        .audio-container iframe {
          width: 100%;
          border: none;
          border-radius: 0.75rem;
        }
        .audio-caption {
          padding: 0.75rem;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          text-align: center;
          font-style: italic;
        }
        .dark .audio-caption {
          background: #374151;
          border-color: #4b5563;
          color: #9ca3af;
        }
        .dark .audio-container audio {
          background: #1f2937;
        }

        /* 音频链接卡片样式 */
        .audio-link {
          margin: 1.5rem 0;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        .audio-link:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        .audio-preview {
          display: flex;
          align-items: center;
          padding: 1rem;
          gap: 1rem;
        }
        .audio-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        .audio-info {
          flex: 1;
          min-width: 0;
        }
        .audio-title {
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
          line-height: 1.3;
        }
        .audio-url {
          color: #6b7280;
          font-size: 0.75rem;
          margin: 0;
          word-break: break-all;
        }
        .audio-button {
          padding: 0.5rem 1rem;
          background: #8b5cf6;
          color: white;
          text-decoration: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          flex-shrink: 0;
          transition: background 0.2s ease;
        }
        .audio-button:hover {
          background: #7c3aed;
          color: white;
        }

        /* 各音频平台特殊样式 */
        .spotify-audio {
          border-color: #1db954;
        }
        .netease-audio {
          border-color: #c62f2f;
        }

        /* 平台链接特殊图标颜色 */
        .spotify-link .audio-icon { color: #1db954; }
        .soundcloud-link .audio-icon { color: #ff5500; }
        .apple-link .audio-icon { color: #fa243c; }
        .netease-link .audio-icon { color: #c62f2f; }
        .qq-link .audio-icon { color: #ffcd00; }

        /* 深色模式音频样式 */
        .dark .audio-link {
          background: #1f2937;
          border-color: #374151;
        }
        .dark .audio-title {
          color: #f9fafb;
        }
        .dark .audio-url {
          color: #9ca3af;
        }

        /* 优化的音频播放器样式 */
        .notion-audio-player {
          margin: 1.5rem 0;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          overflow: hidden;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .notion-audio-header {
          display: flex;
          align-items: center;
          padding: 1rem 1.25rem;
          gap: 0.75rem;
          border-bottom: 1px solid #f1f5f9;
          background: #fefefe;
        }
        .notion-audio-icon {
          font-size: 1.5rem;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 0.5rem;
          flex-shrink: 0;
        }
        .notion-audio-info {
          flex: 1;
          min-width: 0;
        }
        .notion-audio-title {
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
          line-height: 1.25;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .notion-audio-format {
          color: #6b7280;
          margin: 0;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .notion-audio-controls {
          width: 100%;
          height: 3rem;
          background: #ffffff;
          border: none;
          outline: none;
        }
        .notion-audio-controls::-webkit-media-controls-panel {
          background: #ffffff;
        }

        /* 优化的视频播放器样式 */
        .notion-video-player {
          margin: 1.5rem 0;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          overflow: hidden;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .notion-video-header {
          display: flex;
          align-items: center;
          padding: 1rem 1.25rem;
          gap: 0.75rem;
          border-bottom: 1px solid #f1f5f9;
          background: #fefefe;
        }
        .notion-video-icon {
          font-size: 1.5rem;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 0.5rem;
          flex-shrink: 0;
        }
        .notion-video-info {
          flex: 1;
          min-width: 0;
        }
        .notion-video-title {
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
          line-height: 1.25;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .notion-video-format {
          color: #6b7280;
          margin: 0;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .notion-video-controls {
          width: 100%;
          border-radius: 0 0 1rem 1rem;
          background: #000000;
        }

        /* 深色模式适配 */
        .dark .notion-audio-player,
        .dark .notion-video-player {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          border-color: #374151;
        }
        .dark .notion-audio-header,
        .dark .notion-video-header {
          background: #1f2937;
          border-color: #374151;
        }
        .dark .notion-audio-title,
        .dark .notion-video-title {
          color: #f9fafb;
        }
        .dark .notion-audio-format,
        .dark .notion-video-format {
          color: #9ca3af;
        }
        .dark .notion-audio-controls {
          background: #374151;
        }

        /* 改进的列表样式 - 支持多层级嵌套 */
        .notion-list {
          margin: 1.25rem 0;
          padding-left: 0;
        }

        .notion-ul {
          list-style: none;
          position: relative;
        }

        .notion-ol {
          list-style: none;
          counter-reset: notion-counter;
          position: relative;
        }

        .notion-list-item {
          position: relative;
          margin-bottom: 0.75rem;
          line-height: 1.6;
          padding-left: 1.75rem;
        }

        /* 无序列表项目符号 */
        .notion-ul > .notion-list-item::before {
          content: '•';
          position: absolute;
          left: 0.5rem;
          top: 0;
          color: #64748b;
          font-weight: 600;
          font-size: 1.1em;
        }

        /* 有序列表项目符号 */
        .notion-ol > .notion-list-item {
          counter-increment: notion-counter;
        }

        .notion-ol > .notion-list-item::before {
          content: counter(notion-counter) '.';
          position: absolute;
          left: 0;
          top: 0;
          color: #64748b;
          font-weight: 600;
          min-width: 1.5rem;
          text-align: right;
        }

        /* 列表内容区域 */
        .notion-list-content {
          white-space: pre-wrap;
          word-break: break-word;
        }

        /* 嵌套列表容器 */
        .notion-nested-lists {
          margin-top: 0.5rem;
        }

        .notion-nested-list {
          margin: 0.5rem 0 0 0;
          padding-left: 1rem;
        }

        /* 不同层级的样式 */
        .nested-list-2 > .notion-list-item::before {
          color: #94a3b8;
        }

        .nested-list-2.notion-ul > .notion-list-item::before {
          content: '◦';
          font-size: 1em;
        }

        .nested-list-3 > .notion-list-item::before {
          color: #cbd5e1;
        }

        .nested-list-3.notion-ul > .notion-list-item::before {
          content: '▫';
          font-size: 0.9em;
        }

        .nested-list-4 > .notion-list-item::before {
          color: #e2e8f0;
        }

        .nested-list-4.notion-ul > .notion-list-item::before {
          content: '▪';
          font-size: 0.8em;
        }

        /* 有嵌套的列表项增加底部间距 */
        .notion-list-item.has-nested {
          margin-bottom: 1rem;
        }

        /* 深色模式适配 */
        .dark .notion-ul > .notion-list-item::before,
        .dark .notion-ol > .notion-list-item::before {
          color: #94a3b8;
        }

        .dark .nested-list-2 > .notion-list-item::before {
          color: #64748b;
        }

        .dark .nested-list-3 > .notion-list-item::before {
          color: #475569;
        }

        .dark .nested-list-4 > .notion-list-item::before {
          color: #334155;
        }

        /* 响应式设计 */
        @media (max-width: 640px) {
          .notion-list-item {
            padding-left: 1.5rem;
            font-size: 0.95rem;
          }

          .notion-nested-list {
            padding-left: 0.75rem;
          }
        }

      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // 处理数学公式段落，并保持统一段落渲染
          p: ({ children }) => {
            const textContent = getTextFromChildren(children);
            const isPlainText = React.Children.toArray(children).every(child => typeof child === 'string');

            if (isPlainText && textContent.startsWith('$$') && textContent.endsWith('$$')) {
              const expression = textContent.slice(2, -2).trim();
              return <MathFormula expression={expression} displayMode={true} />;
            }

            if (isPlainText && textContent.includes('$') && !textContent.includes('$$')) {
              const parts = textContent.split(/\$([^$]+)\$/g);
              if (parts.length > 1) {
                const elements = parts.map((part, index) => {
                  if (index % 2 === 1) {
                    return <MathFormula key={index} expression={part.trim()} displayMode={false} />;
                  }
                  return part || null;
                }).filter(Boolean);

                return (
                  <p className="leading-7 mb-6 tracking-wide">
                    {elements.map((element, idx) => (
                      <React.Fragment key={idx}>{element}</React.Fragment>
                    ))}
                  </p>
                );
              }
            }

            return (
              <p>
                {children}
              </p>
            );
          },

          // 自定义标题样式，添加 id 属性支持锚点跳转
          h1: ({ children }) => {
            const id = slugifyHeading(getTextFromChildren(children));
            return (
              <h1 id={id || undefined} className="text-3xl font-bold text-gray-900 mt-10 mb-6 leading-tight tracking-tight first:mt-0">
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const id = slugifyHeading(getTextFromChildren(children));
            return (
              <h2 id={id || undefined} className="text-2xl font-semibold text-gray-900 mt-8 mb-4 leading-tight tracking-tight">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = slugifyHeading(getTextFromChildren(children));
            return (
              <h3 id={id || undefined} className="text-xl font-medium text-gray-900 mt-6 mb-3 leading-tight tracking-tight">
                {children}
              </h3>
            );
          },

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
          img: ({ src, alt }) => {
            const imageSrc = typeof src === 'string' ? src : '';
            return <ImageComponent src={imageSrc} alt={alt} />;
          },

          // 代码块样式
          pre: ({ children }) => {
            return <CodeBlock>{children}</CodeBlock>;
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
          blockquote: ({ className, children }) => (
            <blockquote className={className ? `notion-quote ${className}` : 'notion-quote'}>
              {children}
            </blockquote>
          ),

          div: ({ node, className, children, ...rest }) => {
            const castNode = node as MarkdownNode | undefined;
            const properties = (castNode?.properties ?? {}) as Record<string, unknown>;

            if (className?.includes('notion-embed')) {
              return (
                <NotionEmbed
                  type={(properties['data-embed-type'] || properties.dataEmbedType) as string | undefined}
                  url={(properties['data-url'] || properties.dataUrl) as string | undefined}
                  caption={(properties['data-caption'] || properties.dataCaption) as string | undefined}
                  videoType={(properties['data-video-type'] || properties.dataVideoType) as string | undefined}
                  name={(properties['data-name'] || properties.dataName) as string | undefined}
                />
              );
            }

            // 处理多列布局
            if (className?.includes('notion-columns-wrapper')) {
              const columnsData = (properties['data-columns'] || properties.dataColumns) as string | undefined;
              if (columnsData) {
                try {
                  const columns = JSON.parse(columnsData.replace(/&apos;/g, "'")) as string[];
                  return (
                    <div className="notion-column-list">
                      {columns.map((columnContent, index) => (
                        <div key={index} className="notion-column">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, rehypeHighlight]}
                            components={{
                              // 基础元素 - 极简间距
                              p: ({ children }) => <p className="leading-5 mb-1 tracking-normal">{children}</p>,
                              h1: ({ children }) => <h1 className="text-lg font-bold mb-1 text-gray-900">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-base font-semibold mb-1 text-gray-900">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-medium mb-0.5 text-gray-900">{children}</h3>,

                              // 列表 - 极简间距
                              ul: ({ children }) => <ul className="notion-list notion-ul mb-1">{children}</ul>,
                              ol: ({ children }) => <ol className="notion-list notion-ol mb-1">{children}</ol>,
                              li: ({ children }) => <li className="notion-list-item">{children}</li>,

                              // 引用块
                              blockquote: ({ children, className }) => (
                                <blockquote className={className ? `notion-quote ${className}` : 'notion-quote'}>
                                  {children}
                                </blockquote>
                              ),

                              // 代码
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
                              pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,

                              // 图片
                              img: ({ src, alt }) => {
                                const imageSrc = typeof src === 'string' ? src : '';
                                return <ImageComponent src={imageSrc} alt={alt} />;
                              },

                              // 链接
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

                              // 表格
                              table: ({ className, children }) => (
                                <div className="notion-table-wrapper">
                                  <table className={className ? `${className} notion-table` : 'notion-table'}>
                                    {children}
                                  </table>
                                </div>
                              ),

                              // 分隔线
                              hr: () => <hr className="border-t border-gray-200 my-8" />,

                              // 保持所有 div 处理逻辑，但避免递归 column 处理
                              div: ({ node, className, children, ...rest }) => {
                                const divCastNode = node as MarkdownNode | undefined;
                                const divProperties = (divCastNode?.properties ?? {}) as Record<string, unknown>;

                                // 处理嵌入内容
                                if (className?.includes('notion-embed')) {
                                  return (
                                    <NotionEmbed
                                      type={divProperties['data-embed-type'] as string | undefined}
                                      url={divProperties['data-url'] as string | undefined}
                                      caption={divProperties['data-caption'] as string | undefined}
                                      videoType={divProperties['data-video-type'] as string | undefined}
                                      name={divProperties['data-name'] as string | undefined}
                                    />
                                  );
                                }

                                // 跳过列处理以避免无限递归
                                if (className?.includes('notion-columns-wrapper')) {
                                  return <div className="text-red-500 text-sm">⚠️ 不支持嵌套列布局</div>;
                                }

                                return (
                                  <div className={className} {...rest}>
                                    {children}
                                  </div>
                                );
                              },
                            }}
                          >
                            {columnContent}
                          </ReactMarkdown>
                        </div>
                      ))}
                    </div>
                  );
                } catch (error) {
                  console.error('Failed to parse columns data:', error);
                }
              }
            }

            return (
              <div className={className} {...rest}>
                {children}
              </div>
            );
          },

          // 列表样式 - 改进嵌套层级显示
          ul: ({ children, className, node }) => {
            // 检测嵌套层级
            const depth = getListDepth(node as MarkdownNode | undefined);
            const depthClass = depth > 1 ? `nested-list-${Math.min(depth, 4)}` : '';

            return (
              <ul className={`notion-list notion-ul ${depthClass} ${className || ''}`}>
                {children}
              </ul>
            );
          },
          ol: ({ children, className, node }) => {
            // 检测嵌套层级
            const depth = getListDepth(node as MarkdownNode | undefined);
            const depthClass = depth > 1 ? `nested-list-${Math.min(depth, 4)}` : '';

            return (
              <ol className={`notion-list notion-ol ${depthClass} ${className || ''}`}>
                {children}
              </ol>
            );
          },
          li: ({ children, className }) => {
            // 检查是否包含嵌套列表
            const hasNestedList = React.Children.toArray(children).some(child =>
              React.isValidElement(child) && (child.type === 'ul' || child.type === 'ol')
            );

            // 分离文本内容和嵌套列表
            const textContent: React.ReactNode[] = [];
            const nestedLists: React.ReactNode[] = [];

            React.Children.forEach(children, (child) => {
              if (React.isValidElement<{ className?: string }>(child) && (child.type === 'ul' || child.type === 'ol')) {
                nestedLists.push(
                  React.cloneElement(child, {
                    className: `${child.props.className ?? ''} notion-nested-list`.trim() || undefined,
                  })
                );
              } else {
                textContent.push(child);
              }
            });

            return (
              <li className={`notion-list-item ${hasNestedList ? 'has-nested' : ''} ${className || ''}`}>
                <div className="notion-list-content">
                  {textContent}
                </div>
                {nestedLists.length > 0 && (
                  <div className="notion-nested-lists">
                    {nestedLists}
                  </div>
                )}
              </li>
            );
          },

          // 表格样式 - 添加包装器
          table: ({ className, children }) => (
            <div className="notion-table-wrapper">
              <table className={className ? `${className} notion-table` : 'notion-table'}>
                {children}
              </table>
            </div>
          ),
          th: ({ className, children }) => (
            <th className={className}>{children}</th>
          ),
          td: ({ className, children }) => (
            <td className={className}>{children}</td>
          ),

          // 分隔线样式
          hr: () => (
            <hr className="border-t border-gray-200 my-8" />
          ),

          // 不再需要自定义 span 和 mark，因为 rehypeColorPlugin 会处理

        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
}
