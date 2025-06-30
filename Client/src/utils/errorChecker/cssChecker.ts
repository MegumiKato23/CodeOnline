import { CodeError, ErrorChecker, ErrorCheckerOptions } from './typescript'
import postcss from 'postcss'
import * as postcssSafeParser from 'postcss-safe-parser'

export const cssChecker: ErrorChecker = async (code: string, options?: ErrorCheckerOptions) => {
  const errors: CodeError[] = [];
  const ignorePatterns = options?.ignorePatterns || [];
  
  // 使用postcss解析CSS
  let root;
  try {
    root = postcssSafeParser(code);
  } catch (e) {
    // 捕获解析错误
    const errorLines = e.message.split('\n');
    const lineMatch = errorLines[0].match(/:\d+:\d+/);
    
    const errorData = {
      errors: [{
        message: `CSS解析错误: ${errorLines[0]}`,
        severity: 'error' as const,
        from: lineMatch ? parseInt(lineMatch[1]) - 1 : 0,
        to: lineMatch ? parseInt(lineMatch[1]) : 1,
        line: lineMatch ? parseInt(lineMatch[1]) - 1 : 0,
        column: lineMatch ? parseInt(lineMatch[2]) - 1 : 0,
        category: 'syntax' as const
      }],
      diagnostics: [],
      stats: {
        errorCount: 1,
        warningCount: 0,
        suggestionCount: 0
      },
      map: (fn: (error: any) => any) => []
    };
    console.log('CSS Checker Error:', errorData);
    return errorData;
  }
  
  // 计算行列号的辅助函数
  const getLineColumn = (index: number) => {
    const lines = code.substring(0, index).split('\n');
    return {
      line: lines.length - 1,
      column: lines[lines.length - 1].length
    };
  };

  // 1. 检测未闭合的注释和嵌套注释
  let commentStack = [];
  let inComment = false;
  for (let i = 0; i < code.length - 1; i++) {
    if (code.substr(i, 2) === '/*') {
      inComment = true;
      commentStack.push(i);
    }
    if (inComment && code.substr(i, 2) === '*/') {
      inComment = false;
      commentStack.pop();
      i++;
    }
  }
  if (commentStack.length > 0) {
    const startPos = commentStack[0];
    const {line, column} = getLineColumn(startPos);
    const endPos = code.length;
    const {line: endLine, column: endColumn} = getLineColumn(endPos);
    
    errors.push({
      message: commentStack.length > 1 ? 'Nested unclosed CSS comments' : 'Unclosed CSS comment',
      severity: 'warning' as const,
      from: startPos,
      to: endPos,
      line,
      column,
      endLine,
      endColumn,
      category: 'syntax' as const,
      codeSnippet: code.substring(Math.max(0, startPos - 20), Math.min(endPos + 20, code.length)),
      ruleId: 'css-comment-unclosed',
      fixes: commentStack.length > 1 ? [{
        description: 'Add missing closing comment tags',
        edit: {
          from: endPos,
          to: endPos,
          text: '*/'.repeat(commentStack.length)
        }
      }] : undefined
    });
  }

  // 2. 增强属性值验证
  const propValueRegex = /([a-z-]+)\s*:\s*([^;]+);?/g;
  const validValues = {
    'width': ['px', 'em', 'rem', '%', 'vw', 'vh', 'vmin', 'vmax', 'auto', 'inherit', 'initial', 'unset', '0'],
    'height': ['px', 'em', 'rem', '%', 'vw', 'vh', 'vmin', 'vmax', 'auto', 'inherit', 'initial', 'unset', '0'],
    'color': ['#', 'rgb', 'rgba', 'hsl', 'hsla', 'transparent', 'inherit', 'initial', 'unset', 'white', 'black', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'silver', 'gold'],
    'background-color': ['#', 'rgb', 'rgba', 'hsl', 'hsla', 'transparent', 'inherit', 'initial', 'unset', 'white', 'black', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'silver', 'gold']
  };
  
  let propMatch: RegExpExecArray | null;
  while ((propMatch = propValueRegex.exec(code)) !== null) {
    const [full, prop, value] = propMatch;
    const {line, column} = getLineColumn(propMatch.index);
    
    // 检查多个!important
    if (value.includes('!important') && value.match(/!important/g)!.length > 1) {
      errors.push({
        message: `Multiple !important in property: ${prop}`,
        severity: 'warning',
        from: propMatch.index,
        to: propMatch.index + full.length,
        line,
        column,
        fixes: [{
          description: 'Remove duplicate !important',
          edit: {
            from: propMatch.index + full.lastIndexOf('!important'),
            to: propMatch.index + full.length,
            text: ''
          }
        }]
      });
    }
    
    // 检查无效属性值
    if (validValues[prop] && !validValues[prop].some(valid => 
      value.trim().endsWith(valid) || 
      value.trim().startsWith(valid) || 
      value.trim() === valid
    )) {
      errors.push({
        message: `Invalid value for ${prop}: ${value.trim()}`,
        severity: 'error' as const,
        from: propMatch.index,
        to: propMatch.index + full.length,
        line,
        column,
        fixes: [{
          description: 'Use valid value',
          edit: {
            from: propMatch.index + full.indexOf(value),
            to: propMatch.index + full.indexOf(value) + value.length,
            text: '100%'
          }
        }]
      });
    }
  }

  // 检查未闭合的花括号
  let braceStack = [];
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '{') {
      braceStack.push(i);
    }
    if (code[i] === '}') {
      if (braceStack.length === 0) {
        errors.push({
          message: 'Unexpected closing brace',
          severity: 'error' as const,
          from: i,
          to: i + 1,
          line: 0,
          fixes: [{
            description: 'Remove unexpected closing brace',
            edit: {
              from: i,
              to: i + 1,
              text: ''
            }
          }]
        });
      } else {
        braceStack.pop();
      }
    }
  }
  
  if (braceStack.length > 0) {
    errors.push({
      message: 'Unclosed block',
      severity: 'error' as const,
      from: braceStack[0],
      to: braceStack[0] + 1,
      line: 0,
      fixes: [{
        description: 'Add missing closing brace',
        edit: {
          from: code.length,
          to: code.length,
          text: '}'
        }
      }]
    });
  }
  
  // 3. 检测重复属性声明
  const duplicateProps = new Set();
  const propDeclarations = {};
  
  while ((propMatch = propValueRegex.exec(code)) !== null) {
    const prop = propMatch[1];
    if (duplicateProps.has(prop)) {
      const {line, column} = getLineColumn(propMatch.index);
      errors.push({
        message: `Duplicate property declaration: ${prop}`,
        severity: 'warning',
        from: propMatch.index,
        to: propMatch.index + propMatch[0].length,
        line,
        column
      });
    }
    duplicateProps.add(prop);
  }
  
  // 重置正则表达式状态
  propValueRegex.lastIndex = 0;
  
  // 4. 检测Sass/Less变量语法错误
  const variableRegex = /\$[a-zA-Z0-9_-]+/g;
  let varMatch;
  while ((varMatch = variableRegex.exec(code)) !== null) {
    if (!code.includes(varMatch[0] + ':') && !code.includes('@mixin ' + varMatch[0].substring(1))) {
      const {line, column} = getLineColumn(varMatch.index);
      errors.push({
        message: `Undefined Sass/Less variable: ${varMatch[0]}`,
        severity: 'error',
        from: varMatch.index,
        to: varMatch.index + varMatch[0].length,
        line,
        column,
        fixes: [{
          description: 'Define variable',
          edit: {
            from: 0,
            to: 0,
            text: `${varMatch[0]}: ;\n`
          }
        }]
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
        severity: 'error' as const,
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
  
  const result = {
    errors: filteredErrors,
    diagnostics: filteredErrors,
    stats: {
      errorCount: filteredErrors.filter(e => e.severity === 'error').length,
      warningCount: filteredErrors.filter(e => e.severity === 'warning').length,
      suggestionCount: filteredErrors.filter(e => e.severity === 'suggestion').length
    },
    map: (fn: (error: any) => any) => filteredErrors.map(fn)
  } as const;
  console.log('CSS Checker Result:', result);
  return result;
}