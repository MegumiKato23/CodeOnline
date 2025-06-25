import { CodeError, ErrorChecker, ErrorCheckerOptions } from './typescript';

export const jsChecker: ErrorChecker = async (code: string, options?: ErrorCheckerOptions) => {
  const errors: CodeError[] = [];
  const ignorePatterns = options?.ignorePatterns || [];
  
  try {
    // 1. 语法错误检测
    new Function(code);
  } catch (e) {
    if (e instanceof SyntaxError) {
      errors.push({
        message: `Syntax Error: ${e.message}`,
        severity: 'error',
        from: 0,
        to: code.length,
        line: 0
      });
    }
  }

  // 2. 变量未定义检查
  const undefinedVarRegex = /\b(\w+)\b(?![\s\S]*?\b(var|let|const|function|class)\s+\1\b)/g;
  let varMatch;
  const declaredVars = new Set<string>();
  
  // 收集所有声明的变量
  const declarationRegex = /\b(var|let|const|function|class)\s+(\w+)/g;
  while ((varMatch = declarationRegex.exec(code)) !== null) {
    declaredVars.add(varMatch[2]);
  }
  
  // 检查未定义的变量
  while ((varMatch = undefinedVarRegex.exec(code)) !== null) {
    const varName = varMatch[1];
    if (!declaredVars.has(varName) && 
        !['true', 'false', 'null', 'undefined', 'this', 'console', 'window', 'document'].includes(varName)) {
      errors.push({
        message: `Undefined variable: ${varName}`,
        severity: 'error',
        from: varMatch.index,
        to: varMatch.index + varName.length,
        line: 0
      });
    }
  }

  // 3. 类型不匹配警告
  const typeMismatchRegex = /\b(\w+)\s*([=!]==?)\s*('[^']*'|"[^"]*"|\d+|true|false|null|undefined)\b/g;
  let typeMatch;
  while ((typeMatch = typeMismatchRegex.exec(code)) !== null) {
    const [full, varName, operator, value] = typeMatch;
    errors.push({
      message: `Potential type mismatch: ${varName} ${operator} ${value}`,
      severity: 'warning',
      from: typeMatch.index,
      to: typeMatch.index + full.length,
      line: 0
    });
  }

  // 4. 常见编码规范检查
  // 4.1 未使用的变量
  const unusedVarRegex = /\b(var|let|const)\s+(\w+)\b(?![\s\S]*?\b\2\b(?!\s*[=:]))/g;
  let unusedMatch;
  while ((unusedMatch = unusedVarRegex.exec(code)) !== null) {
    const varName = unusedMatch[2];
    errors.push({
      message: `Unused variable: ${varName}`,
      severity: 'suggestion',
      from: unusedMatch.index,
      to: unusedMatch.index + unusedMatch[0].length,
      line: 0
    });
  }

  // 4.2 使用==而不是===
  const looseEqualityRegex = /\b(\w+)\s*==\s*(\w+)\b/g;
  let equalityMatch;
  while ((equalityMatch = looseEqualityRegex.exec(code)) !== null) {
    errors.push({
      message: `Use strict equality (===) instead of loose equality (==)`,
      severity: 'suggestion',
      from: equalityMatch.index,
      to: equalityMatch.index + equalityMatch[0].length,
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