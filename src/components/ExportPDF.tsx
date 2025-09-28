'use client';

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { logger } from '@/lib/logger';

interface ExportPDFProps {
  title?: string;
  filename?: string;
  contentId?: string;
  className?: string;
}

export default function ExportPDF({
  title = '导出 PDF',
  filename = 'document',
  contentId = 'pdf-content',
  className = ''
}: ExportPDFProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);

    try {
      // 获取要导出的内容元素
      const element = document.getElementById(contentId);
      if (!element) {
        throw new Error('未找到要导出的内容');
      }

      // 临时修改样式以优化 PDF 输出
      const originalStyle = element.style.cssText;
      element.style.width = '800px';
      element.style.padding = '20px';
      element.style.background = 'white';
      element.style.color = 'black';

      // 使用 html2canvas 将 HTML 转换为画布
      const canvas = await html2canvas(element, {
        scale: 2, // 提高分辨率
        useCORS: true, // 允许跨域图片
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 850,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          // 在克隆的文档中进行额外的样式调整
          const clonedElement = clonedDoc.getElementById(contentId);
          if (clonedElement) {
            // 隐藏不需要在 PDF 中显示的元素
            const hideElements = clonedElement.querySelectorAll('.no-pdf, .export-pdf-button, button');
            hideElements.forEach((el) => {
              (el as HTMLElement).style.display = 'none';
            });

            // 确保代码块正常显示
            const codeBlocks = clonedElement.querySelectorAll('pre');
            codeBlocks.forEach((pre) => {
              (pre as HTMLElement).style.whiteSpace = 'pre-wrap';
              (pre as HTMLElement).style.wordBreak = 'break-word';
            });

            // 优化图片大小
            const images = clonedElement.querySelectorAll('img');
            images.forEach((img) => {
              const imgEl = img as HTMLImageElement;
              if (imgEl.width > 760) {
                imgEl.style.maxWidth = '760px';
                imgEl.style.height = 'auto';
              }
            });
          }
        }
      });

      // 恢复原始样式
      element.style.cssText = originalStyle;

      // 创建 PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // 留出边距
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      // 添加第一页
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 如果内容超过一页，添加更多页
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 添加元数据
      pdf.setProperties({
        title: title,
        creator: 'Simple Blog',
        author: 'Simple Blog',
        keywords: 'blog, pdf, export',
        subject: title
      });

      // 保存 PDF
      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`${filename}-${timestamp}.pdf`);

      logger.info('PDF 导出成功');
    } catch (error) {
      logger.error('PDF 导出失败:', error);
      alert('PDF 导出失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToPDF}
      disabled={isExporting}
      className={`export-pdf-button inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isExporting ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          正在导出...
        </>
      ) : (
        <>
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v6h6"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 14h6M9 17h3"
            />
          </svg>
          {title}
        </>
      )}
    </button>
  );
}