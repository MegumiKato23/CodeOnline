// src/services/security.ts
export const SecurityService = {
  // 仅用于显示的内容净化
  sanitizeForDisplay: (html: string): string => {
    if (!html) return '';
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  // 用于文档写入的内容净化
  sanitizeForWrite: (html: string): string => {
    if (!html) return '';
    return html
      .replace(/<\/script>/gi, '<\\/script>') // 防止脚本结束
      .replace(/javascript:/gi, 'javascript&colon;') // 禁用JS伪协议
      .replace(/on\w+=["'][^"']*["']/gi, ''); // 移除事件处理器
  },

  // XSS检查
  hasXSS: (code: string): boolean => {
    if (!code) return false;
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+=["'][^"']*["']/gi
    ];
    return xssPatterns.some(pattern => pattern.test(code));
  },
  // 新增SQL注入检测（基于SQLMap测试模式）
  hasSQLInjection: (input: string): boolean => {
    if (!input) return false;
    
    // 覆盖SQLMap测试的所有数据库类型
    const patterns = [
      // 时间盲注检测
      /(sleep|benchmark|waitfor|delay)\s*\(/i,
      /(dbms_pipe\.receive_message|dbms_lock\.sleep)\s*\(/i,
      
      // 联合查询检测
      /\bunion\b.*\bselect\b/i,
      
      // 数据库特定语法
      /(procedure analyse|extractvalue|make_set|elt)\s*\(/i,
      
      // 通用危险字符
      /(['";]|--|\/\*|\*\/)/,
      
      // 基于您SQLMap截图的特定规则
      /(clickhouse|mysql|postgresql|oracle|sql server)\s+.*(time-based|blind)/i
    ];
    
    return patterns.some(pattern => pattern.test(input));
  },

  // 新增SQL净化方法
  sanitizeForSQL: (input: string): string => {
    if (!input) return '';
    
    // 替换危险字符（保留功能字符）
    return input
      .replace(/'/g, "''")
      .replace(/--/g, '\\-\\-')
      .replace(/;/g, '\\;')
      .replace(/\/\*/g, '\\/\\*');
  }
}