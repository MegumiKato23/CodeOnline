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
  hasSQLInjection: (input: string): boolean => {
    if (!input || typeof input !== 'string') return false;

    // 增强的SQL注入模式检测
    const patterns = [
      // 经典注入
      /(['"`]\s*)(OR|AND)\s*\1?\d+\s*=\s*\d+/i,
      /(['"`]\s*)(OR|AND)\s*\1?['"`]\s*=\s*['"`]/i,
      
      // 语句分隔
      /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)/i,
      
      // 联合查询
      /\bUNION\b.*\bSELECT\b.*\bFROM\b/i,
      
      // 数据库函数
      /\b(sleep|benchmark|waitfor|delay)\s*\(\s*\d+\s*\)/i,
      
      // 系统函数
      /\b(xp_cmdshell|sp_oacreate)\s*\(/i,
      
      // 特殊条件
      /\b(1=1|0=0|true|false)\b/i,
      
      // 注释
      /--\s+\S+/,
      /\/\*.*\*\//
    ];

    return patterns.some(pattern => pattern.test(input));
  },
  hasPotentialSQLInjectionInCode: (code: string): boolean => {
    if (!code) return false;
    
    // 提取代码中的所有字符串内容
    const stringContents = [];
    const stringRegex = /(['"`])(?:\\.|.)*?\1/g;
    let match;
    
    while ((match = stringRegex.exec(code)) !== null) {
      stringContents.push(match[0]);
    }
    
    // 检查每个字符串内容
    return stringContents.some(str => 
      SecurityService.hasSQLInjection(str.slice(1, -1)) // 去除引号
    );
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
