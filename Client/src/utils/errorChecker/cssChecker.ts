import { CodeError, ErrorChecker, ErrorCheckerOptions } from './typescript'

export const cssChecker: ErrorChecker = async (code: string, options?: ErrorCheckerOptions) => {
  const errors: CodeError[] = [];
  let inComment = false;
  const ignorePatterns = options?.ignorePatterns || [];

  // 1. 检测未闭合的注释
  for (let i = 0; i < code.length - 1; i++) {
    if (code.substr(i, 2) === '/*') inComment = true;
    if (inComment && code.substr(i, 2) === '*/') {
      inComment = false;
      i++;
    }
  }
  if (inComment) {
    errors.push({
      message: 'Unclosed CSS comment',
      severity: 'warning',
      from: code.lastIndexOf('/*'),
      to: code.length,
      line: 0
    });
  }

  // 2. 增强属性值验证
  const propValueRegex = /([a-z-]+)\s*:\s*([^;]+);?/g;
  let propMatch: RegExpExecArray | null;
  while ((propMatch = propValueRegex.exec(code)) !== null) {
    const [full, prop, value] = propMatch;
    if (value.includes('!important') && value.match(/!important/g)!.length > 1) {
      errors.push({
        message: `Multiple !important in property: ${prop}`,
        severity: 'warning',
        from: propMatch.index,
        to: propMatch.index + full.length,
        line: 0
      });
    }
  }

  // 检查未闭合的花括号
  let braceLevel = 0
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '{') braceLevel++
    if (code[i] === '}') braceLevel--
    
    if (braceLevel < 0) {
      errors.push({
        message: 'Unexpected closing brace',
        severity: 'error',
        from: i,
        to: i + 1,
        line: 0
      })
      braceLevel = 0
    }
  }
  
  if (braceLevel > 0) {
    errors.push({
      message: 'Unclosed block',
      severity: 'error',
      from: code.length - 1,
      to: code.length,
      line: 0
    })
  }
  
  // 3. 检测Sass/Less变量语法错误
  const variableRegex = /\$[a-zA-Z0-9_-]+/g;
  let varMatch;
  while ((varMatch = variableRegex.exec(code)) !== null) {
    if (!code.includes(varMatch[0] + ':')) {
      errors.push({
        message: `Undefined Sass/Less variable: ${varMatch[0]}`,
        severity: 'warning',
        from: varMatch.index,
        to: varMatch.index + varMatch[0].length,
        line: 0
      });
    }
  }

  // 4. 检测嵌套规则语法错误
  const nestingRegex = /&[^{}]*{[^{}]*}/g;
  let nestingMatch;
  while ((nestingMatch = nestingRegex.exec(code)) !== null) {
    if (!code.includes('@nest') && !code.includes('@at-root')) {
      errors.push({
        message: 'Possible invalid nesting syntax without @nest or @at-root',
        severity: 'warning',
        from: nestingMatch.index,
        to: nestingMatch.index + nestingMatch[0].length,
        line: 0
      });
    }
  }

  // 5. 检测mixin使用错误
  const mixinRegex = /@include\s+([a-zA-Z0-9_-]+)/g;
  let mixinMatch;
  while ((mixinMatch = mixinRegex.exec(code)) !== null) {
    if (!code.includes(`@mixin ${mixinMatch[1]}`)) {
      errors.push({
        message: `Undefined mixin: ${mixinMatch[1]}`,
        severity: 'error',
        from: mixinMatch.index,
        to: mixinMatch.index + mixinMatch[0].length,
        line: 0
      });
    }
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
}