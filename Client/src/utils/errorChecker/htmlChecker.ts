import { CodeError, ErrorChecker, ErrorCheckerOptions } from './typescript';

// 定义HTML5标准标签及其允许的嵌套关系
const HTML5_TAGS = {
  // 块级元素
  block: ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'form', 'section', 'article', 'header', 'footer', 'nav', 'aside'],
  // 内联元素
  inline: ['span', 'a', 'strong', 'em', 'i', 'b', 'u', 'img', 'input', 'button', 'label', 'select', 'textarea'],
  // 特殊元素
  special: ['html', 'head', 'body', 'meta', 'link', 'script', 'style', 'title']
};

// 定义不允许嵌套的标签组合
const INVALID_NESTING = [
  ['p', 'div'],
  ['p', 'ul'],
  ['p', 'ol'],
  ['a', 'a'],
  ['button', 'button']
];

// 定义必须包含的父元素
const REQUIRED_PARENTS = {
  'li': ['ul', 'ol'],
  'tr': ['table'],
  'td': ['tr'],
  'th': ['tr'],
  'thead': ['table'],
  'tbody': ['table'],
  'tfoot': ['table'],
  'option': ['select'],
  'optgroup': ['select']
};
export const htmlChecker: ErrorChecker = async (code: string, options?: ErrorCheckerOptions) => {
  const errors: CodeError[] = [];
  const openTags: { name: string; position: number; parent?: string }[] = [];
  const ignorePatterns = options?.ignorePatterns || [];
  
  // 1. 增强标签解析器
  const tagRegex = /<(\/?)([a-zA-Z][^\s>]*)([^>]*)>/g;
  let match: RegExpExecArray | null;
  
  while ((match = tagRegex.exec(code)) !== null) {
    const [fullMatch, isClosing, tagName, attributes] = match;
    const currentTag = tagName.toLowerCase();
    
    // 检查自闭合标签
    const isSelfClosing = attributes.endsWith('/') || ['img', 'br', 'input', 'meta', 'link', 'hr'].includes(currentTag);
    
    if (isClosing) {
      // 处理闭合标签
      const lastOpenTag = openTags.pop();
      if (!lastOpenTag || lastOpenTag.name !== currentTag) {
        errors.push({
          message: `Mismatched closing tag: expected </${lastOpenTag?.name || '?'}> but found </${currentTag}>`,
          severity: 'error',
          from: match.index,
          to: match.index + fullMatch.length,
          line: 0
        });
      }
    } else if (!isSelfClosing) {
      // 记录非自闭合的开放标签
      const parentTag = openTags.length > 0 ? openTags[openTags.length - 1].name : undefined;
      openTags.push({ name: currentTag, position: match.index, parent: parentTag });
      
      // 2. 检查必须包含的父元素
      if (REQUIRED_PARENTS[currentTag]) {
        if (!parentTag || !REQUIRED_PARENTS[currentTag].includes(parentTag)) {
          errors.push({
            message: `Tag <${currentTag}> must be inside <${REQUIRED_PARENTS[currentTag].join('> or <')}>`,
            severity: 'error',
            from: match.index,
            to: match.index + fullMatch.length,
            line: 0
          });
        }
      }
      
      // 3. 检查无效的嵌套组合
      if (parentTag) {
        for (const [parent, child] of INVALID_NESTING) {
          if ((parent === parentTag && child === currentTag) || 
              (child === parentTag && parent === currentTag)) {
            errors.push({
              message: `Invalid nesting: <${parentTag}> cannot contain <${currentTag}>`,
              severity: 'error',
              from: match.index,
              to: match.index + fullMatch.length,
              line: 0
            });
          }
        }
      }
    }
    
    // 4. 增强属性检查
    const attrRegex = /(\S+)=["']([^"']*)["']|(\S+)(?=[\s>])/g;
    const seenAttrs = new Set<string>();
    let attrMatch: RegExpExecArray | null;
    
    while ((attrMatch = attrRegex.exec(attributes)) !== null) {
      const attrName = (attrMatch[1] || attrMatch[3]).toLowerCase();
      
      // 检查重复属性
      if (seenAttrs.has(attrName)) {
        errors.push({
          message: `Duplicate attribute: ${attrName}`,
          severity: 'error',
          from: match.index + match[0].indexOf(attrMatch[0]),
          to: match.index + match[0].indexOf(attrMatch[0]) + attrMatch[0].length,
          line: 0
        });
      }
      seenAttrs.add(attrName);
      
      // 检查无效属性值
      if (attrMatch[2] && attrMatch[2].trim() === '') {
        errors.push({
          message: `Empty value for attribute: ${attrName}`,
          severity: 'warning',
          from: match.index + match[0].indexOf(attrMatch[0]),
          to: match.index + match[0].indexOf(attrMatch[0]) + attrMatch[0].length,
          line: 0
        });
      }
    }
  }
  
  // 5. 检查未闭合的标签
  openTags.forEach(tag => {
    return errors.push({
      message: `Unclosed tag: <${tag.name}>`,
      severity: 'error',
      from: tag.position,
      to: tag.position + tag.name.length + 1,
      line: 0
    });
  });
  
  // 6. 检查文档结构完整性
  const hasHtmlTag = code.includes('<html') && code.includes('</html>');
  const hasHeadTag = code.includes('<head') && code.includes('</head>');
  const hasBodyTag = code.includes('<body') && code.includes('</body>');
  
  if (!hasHtmlTag) {
    errors.push({
      message: 'Missing <html> tag',
      severity: 'warning',
      from: 0,
      to: 0,
      line: 0
    });
  }
  
  if (hasHtmlTag && !hasHeadTag) {
    errors.push({
      message: 'Missing <head> section',
      severity: 'warning',
      from: 0,
      to: 0,
      line: 0
    });
  }
  
  if (hasHtmlTag && !hasBodyTag) {
    errors.push({
      message: 'Missing <body> section',
      severity: 'warning',
      from: 0,
      to: 0,
      line: 0
    });
  }
  
  // 过滤掉用户指定忽略的错误模式
  const filteredErrors = errors.filter(error => 
    !ignorePatterns.some(pattern => error.message.includes(pattern))
  );
  
  return {
    errors: filteredErrors,
    diagnostics: filteredErrors,
    stats: {
      errorCount: filteredErrors.filter(e => e.severity === 'error').length,
      warningCount: filteredErrors.filter(e => e.severity === 'warning').length,
      suggestionCount: filteredErrors.filter(e => e.severity === 'suggestion').length
    },
    map: (fn: (error: any) => any) => filteredErrors.map(fn)
  };
};