// 简单的日志工具，区分开发和生产环境
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  // 开发环境显示详细信息，生产环境静默
  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  // 信息日志，生产环境也会显示
  info: (message: string, ...args: unknown[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },

  // 警告日志，始终显示
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  // 错误日志，始终显示但在生产环境简化
  error: (message: string, error?: unknown) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      // 生产环境只显示关键信息，不暴露详细错误
      console.error(`[ERROR] ${message}`);
    }
  },
};