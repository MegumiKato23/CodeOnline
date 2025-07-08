// src/services/security.ts
export const SecurityService = {
  // 仅用于显示的内容净化
  sanitizeForDisplay: (html: string): string => {
    if (!html) return '';
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
      /on\w+=["'][^"']*["']/gi,
    ];
    return xssPatterns.some((pattern) => pattern.test(code));
  },
  // 新增SQL注入检测（基于SQLMap测试模式）
  hasSQLInjection: (input: string): boolean => {
    if (!input || typeof input !== 'string') return false;

    // 排除常见合法字符组合的误报
    const falsePositives = [
      /^[\w\s.,!?@#$%^&*()\-+=]+$/i, // 仅包含常规字符
      /^https?:\/\/\S+$/i, // URL
      /^[\w.%+-]+@[\w.-]+\.[a-z]{2,}$/i, // 邮箱
      /^\d{4}-\d{2}-\d{2}$/, // 日期
    ];

    // 如果匹配任何合法模式，直接返回false
    if (falsePositives.some(pattern => pattern.test(input))) {
      return false;
    }

    // 严格检测SQL注入模式
    const patterns = [
      // 注释检测
      /(--|\/\*|\*\/|\#)/,
      
      // 语句分隔符
      /;/,
      
      // 联合查询
      /\bunion\b.*\bselect\b/i,
      
      // 数据库函数
      /(sleep|benchmark|waitfor|delay|if|case|procedure\s+analyse|extractvalue|make_set|elt)\s*\(/i,
      
      // 系统函数
      /(system|exec|xp_cmdshell|sp_oacreate)\s*\(/i,
      
      // 特殊字符
      /['"`]\s*or\s*['"`]?[0-9]+\s*=\s*[0-9]+/i,
      
      // 条件语句
      /\b(1=1|0=0|true|false)\b/i,
    ];

    return patterns.some(pattern => pattern.test(input));
  },

  // 新增SQL净化方法
  sanitizeForSQL: (input: string): string => {
    if (!input) return '';

    // 替换危险字符（保留功能字符）
    return input.replace(/'/g, "''").replace(/--/g, '\\-\\-').replace(/;/g, '\\;').replace(/\/\*/g, '\\/\\*');
  },
  // 新增弹窗警告方法
  showSecurityAlert: (type: 'xss' | 'sql', message: string): void => {
    // 移除已存在的同类型警告
    document.querySelectorAll(`.security-alert[data-type="${type}"]`).forEach(el => el.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `security-alert alert-${type}`;
    alertDiv.dataset.type = type;
    
    const icon = type === 'xss' ? '⚠️' : '🛡️';
    const title = type === 'xss' ? 'XSS攻击警告' : 'SQL注入警告';
    const color = type === 'xss' ? '#ff6b6b' : '#f06595';
    
    alertDiv.innerHTML = `
      <div class="alert-header">
        <span class="alert-icon">${icon}</span>
        <h3 class="alert-title">${title}</h3>
        <button class="close-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="alert-body">
        <p>${message}</p>
      </div>
      <div class="alert-progress"></div>
    `;
    
    alertDiv.querySelector('.close-btn')?.addEventListener('click', () => {
      alertDiv.classList.add('fade-out');
      setTimeout(() => alertDiv.remove(), 300);
    });
    
    document.body.appendChild(alertDiv);
    
    // 进度条动画
    const progressBar = alertDiv.querySelector('.alert-progress') as HTMLElement;
    if (progressBar) {
      progressBar.style.animation = `progress ${type === 'xss' ? 5000 : 7000}ms linear forwards`;
    }
    
    // 5/7秒后自动消失
    setTimeout(() => {
      if (document.body.contains(alertDiv)) {
        alertDiv.classList.add('fade-out');
        setTimeout(() => alertDiv.remove(), 300);
      }
    }, type === 'xss' ? 5000 : 7000);
  },
};
