interface ReadingTimeProps {
  content: string;
}

export default function ReadingTime({ content }: ReadingTimeProps) {
  // 计算阅读时间（平均每分钟250个中文字符或200个英文单词）
  const calculateReadingTime = (text: string): number => {
    // 去除 markdown 语法
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '') // 代码块
      .replace(/`[^`]+`/g, '') // 行内代码
      .replace(/!\[.*?\]\(.*?\)/g, '') // 图片
      .replace(/\[.*?\]\(.*?\)/g, '') // 链接
      .replace(/#{1,6}\s+/g, '') // 标题
      .replace(/[*_]{1,2}(.*?)[*_]{1,2}/g, '$1') // 粗体斜体
      .replace(/\n/g, ' ') // 换行
      .trim();

    // 中文字符数
    const chineseChars = (cleanText.match(/[\u4e00-\u9fff]/g) || []).length;

    // 英文单词数
    const englishWords = cleanText
      .replace(/[\u4e00-\u9fff]/g, '') // 移除中文
      .split(/\s+/)
      .filter(word => word.length > 0).length;

    // 计算总阅读时间（分钟）
    const chineseTime = chineseChars / 250; // 每分钟250个中文字符
    const englishTime = englishWords / 200; // 每分钟200个英文单词
    const totalMinutes = Math.max(1, Math.ceil(chineseTime + englishTime));

    return totalMinutes;
  };

  const readingTime = calculateReadingTime(content);

  return (
    <span className="text-gray-500 dark:text-gray-400 text-sm">
      📖 {readingTime} 分钟阅读
    </span>
  );
}