'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface NotionImageProps {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
}

export default function NotionImage({ src, alt, className = '' }: NotionImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // 确保只在客户端渲染 Portal
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 处理无意义的文件名作为 alt
    const isMeaninglessAlt = (text: string) => {
        if (!text) return true;
        const lower = text.toLowerCase().trim();
        const meaningless = ['image', 'img', 'untitled', 'screenshot', 'png', 'jpg', 'jpeg', 'webp'];
        return meaningless.some(m => lower.includes(m)) || /^\d+$/.test(lower);
    };

    const showCaption = alt && !isMeaninglessAlt(alt);

    // 键盘事件处理 ESC 关闭预览
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isZoomed) {
                setIsZoomed(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isZoomed]);

    // 锁定/解锁背景滚动
    useEffect(() => {
        if (isZoomed) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isZoomed]);

    if (error) {
        return (
            <div className={`w-full h-48 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-400 rounded-lg ${className}`}>
                <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">图片加载失败</span>
            </div>
        );
    }

    return (
        <div className={`my-6 ${className}`}>
            <div className="relative w-full h-auto group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    alt={alt || ''}
                    title={alt || ''}
                    src={src}
                    className={`w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    style={{ objectFit: 'contain', maxWidth: '100%' }}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setError(true);
                    }}
                    onClick={() => setIsZoomed(true)}
                />
                {/* 放大提示图标 */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">🔍 点击放大</div>
                </div>
            </div>

            {showCaption && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 italic">
                    {alt}
                </p>
            )}

            {/* Lightbox Preview */}
            {isMounted && isZoomed && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsZoomed(false)}
                >
                    <div className="relative w-full h-full p-4 flex items-center justify-center">
                        {/* 关闭按钮 */}
                        <button
                            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsZoomed(false);
                            }}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* 预览大图 - 使用原生 img */}
                        <div
                            className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={src}
                                alt={alt || ''}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        {/* 底部 caption */}
                        {showCaption && (
                            <div className="absolute bottom-8 left-0 right-0 text-center px-4 pointer-events-none">
                                <span className="inline-block px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-sm">
                                    {alt}
                                </span>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
