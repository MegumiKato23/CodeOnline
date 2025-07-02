import { CodeError, ErrorChecker, ErrorCheckerOptions } from './typescript';

export const jsChecker: ErrorChecker = async (code: string, options?: ErrorCheckerOptions) => {
  const errors: CodeError[] = [];
  const ignorePatterns = options?.ignorePatterns || [];

  // 1. 检查未闭合的括号
  const bracketPairs: Record<string, string> = {
    '(': ')',
    '[': ']',
    '{': '}'
  };
  
  const stack: {char: string; index: number}[] = [];
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    
    // 检查开括号
    if (bracketPairs[char]) {
      stack.push({char, index: i});
    } 
    // 检查闭括号
    else if (Object.values(bracketPairs).includes(char)) {
      const last = stack.pop();
      if (!last || bracketPairs[last.char] !== char) {
        errors.push({
          message: `Mismatched bracket: ${char}`,
          severity: 'error',
          from: i,
          to: i + 1,
          line: 0
        });
      }
    }
  }
  
  // 检查未闭合的括号
  stack.forEach(({char, index}) => {
    errors.push({
      message: `Unclosed bracket: ${char}`,
      severity: 'error',
      from: index,
      to: index + 1,
      line: 0
    });
  });

  // 过滤掉字符串内容
  const codeWithoutStrings = code.replace(/(["'`])(?:\\.|[^\\])*?\1/g, '');

  // 2. 检查未声明的变量
  const variableRegex = /(?:^|[^\w.])(var|let|const)\s+([a-zA-Z_$][\w$]*)/g;
  const declaredVars = new Set<string>();
  let varMatch: RegExpExecArray | null;
  
  while ((varMatch = variableRegex.exec(codeWithoutStrings)) !== null) {
    declaredVars.add(varMatch[2]);
  }
  
  const usageRegex = /(?:^|[^\w.])([a-zA-Z_$][\w$]*)(?=\s*[^\w])/g;
  let usageMatch: RegExpExecArray | null;
  
  while ((usageMatch = usageRegex.exec(codeWithoutStrings)) !== null) {
    const varName = usageMatch[1];
    if (!declaredVars.has(varName) && !['true', 'false', 'null', 'undefined', 'this', 'super', 'console'].includes(varName)) {
      errors.push({
        message: `Undeclared variable: ${varName}`,
        severity: 'error',
        from: usageMatch.index,
        to: usageMatch.index + varName.length,
        line: 0
      });
    }
  }

  // 3. 检查未使用的变量
  const usedVars = new Set<string>();
  const varUsageRegex = /(?:^|[^\w.])([a-zA-Z_$][\w$]*)(?=\s*[^\w])/g;
  let varUsageMatch: RegExpExecArray | null;
  
  while ((varUsageMatch = varUsageRegex.exec(codeWithoutStrings)) !== null) {
    usedVars.add(varUsageMatch[1]);
  }
  
  declaredVars.forEach(varName => {
    if (!usedVars.has(varName)) {
      errors.push({
        message: `Unused variable: ${varName}`,
        severity: 'warning',
        from: 0,
        to: 0,
        line: 0
      });
    }
  });

  // 4. 检查重复的变量声明
  const duplicateVarRegex = /(?:^|[^\w.])(var|let|const)\s+([a-zA-Z_$][\w$]*)/g;
  const varCounts: Record<string, number> = {};
  let dupVarMatch: RegExpExecArray | null;
  
  while ((dupVarMatch = duplicateVarRegex.exec(codeWithoutStrings)) !== null) {
    const varName = dupVarMatch[2];
    varCounts[varName] = (varCounts[varName] || 0) + 1;
    
    if (varCounts[varName] > 1) {
      errors.push({
        message: `Duplicate variable declaration: ${varName}`,
        severity: 'warning',
        from: dupVarMatch.index,
        to: dupVarMatch.index + dupVarMatch[0].length,
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
};