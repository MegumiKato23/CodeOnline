import { CodeError, ErrorChecker, ErrorCheckerOptions } from './typescript';
import * as esprima from 'esprima';
import * as ts from 'typescript';

export const jsChecker: ErrorChecker = async (code: string, options?: ErrorCheckerOptions) => {
  const errors: CodeError[] = [];
  const ignorePatterns = options?.ignorePatterns || [];
  
  // 添加TypeScript类型检查
  const tsErrors: CodeError[] = [];
  const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true);
  const program = ts.createProgram(['temp.ts'], {});
  const checker = program.getTypeChecker();
  
  ts.forEachChild(sourceFile, node => {
    const diagnostics = program.getSemanticDiagnostics(node.getSourceFile());
    diagnostics.forEach(diagnostic => {
      if (diagnostic.start && diagnostic.length) {
        const start = diagnostic.start;
        const end = start + diagnostic.length;
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(start);
        
        tsErrors.push({
          message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
          severity: 'error' as const,
          from: start,
          to: end,
          line: line,
          column: character,
          category: 'type'
        });
      }
    });
  });

  try {
    const ast = esprima.parseScript(code, { tolerant: true, loc: true });
  } catch (e) {
    if (e instanceof Error && 'index' in e && 'description' in e && 'lineNumber' in e && 'column' in e) {
      const syntaxError = e as {index: number, description?: string, lineNumber: number, column: number, message: string};
      const errorData: CodeError = {
        message: `Syntax Error: ${syntaxError.message}`,
        severity: 'error' as const,
        from: syntaxError.index,
        to: syntaxError.index + (syntaxError.description?.length || 0),
        line: syntaxError.lineNumber - 1,
        column: syntaxError.column,
        category: 'syntax'
      };
      console.log('JS Checker Error:', errorData);
      errors.push(errorData);
    }
  }

  const scopeStack: Array<Set<string>> = [new Set()];
  const functionStack: Array<Set<string>> = [new Set()];

  const walk = (node: any) => {
    if (node.type === 'VariableDeclaration') {
      node.declarations.forEach((decl: any) => {
        if (decl.id.type === 'Identifier') {
          scopeStack[scopeStack.length - 1].add(decl.id.name);
        }
      });
    } else if (node.type === 'FunctionDeclaration') {
      functionStack[functionStack.length - 1].add(node.id.name);
    } else if (node.type === 'BlockStatement') {
      scopeStack.push(new Set());
      functionStack.push(new Set());
    }
  };

  const leave = (node: any) => {
    if (node.type === 'BlockStatement') {
      scopeStack.pop();
      functionStack.pop();
    }
  };

  esprima.parseScript(code, { tolerant: true, loc: true }, (node: any) => {
    walk(node);
    leave(node);
  });

  const walkReferences = (node: any) => {
    if (node.type === 'Identifier' && !node.parent) {
      const varName = node.name;
      if (!scopeStack.some(scope => scope.has(varName)) &&
          !functionStack.some(fnScope => fnScope.has(varName)) &&
          !['true', 'false', 'null', 'undefined', 'this', 'console', 'window', 'document', 'log', 'alert', 'setTimeout', 'setInterval'].includes(varName)) {
        errors.push({
          message: `Undefined variable: ${varName}`,
          severity: 'error' as const,
          from: node.start,
          to: node.end,
          line: node.loc.start.line - 1,
          column: node.loc.start.column,
          category: 'semantic'
        });
      }
    }
  };

  esprima.parseScript(code, { tolerant: true, loc: true }, (node: any) => {
    walk(node);
    walkReferences(node);
    leave(node);
  });

  const walkFunctionCalls = (node: any) => {
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
      const funcName = node.callee.name;
      if (!functionStack.some(fnScope => fnScope.has(funcName)) &&
          !['console', 'window', 'document', 'alert', 'setTimeout', 'setInterval', 'log'].includes(funcName)) {
        errors.push({
          message: `Undefined function call: ${funcName}()`,
          severity: 'error' as const,
          from: node.start,
          to: node.end,
          line: node.loc.start.line - 1,
          column: node.loc.start.column,
          category: 'semantic'
        });
      }
    }
  };

  esprima.parseScript(code, { tolerant: true, loc: true }, (node: any) => {
    walk(node);
    walkReferences(node);
    walkFunctionCalls(node);
    leave(node);
  });

  const walkRedeclarations = (node: any) => {
    if (node.type === 'VariableDeclaration') {
      node.declarations.forEach((decl: any) => {
        if (decl.id.type === 'Identifier') {
          const varName = decl.id.name;
          if (scopeStack[scopeStack.length - 1].has(varName)) {
            errors.push({
              message: `Redeclaration of variable: ${varName}`,
              severity: 'warning' as const,
              from: node.start,
              to: node.end,
              line: node.loc.start.line - 1,
              column: node.loc.start.column,
              category: 'semantic'
            });
          }
          scopeStack[scopeStack.length - 1].add(varName);
        }
      });
    }
  };

  esprima.parseScript(code, { tolerant: true, loc: true }, (node: any) => {
    walk(node);
    walkReferences(node);
    walkFunctionCalls(node);
    walkRedeclarations(node);
    leave(node);
  });

  const walkTypeMismatch = (node: any) => {
    if (node.type === 'BinaryExpression' || node.type === 'LogicalExpression') {
      const leftType = getNodeType(node.left);
      const rightType = getNodeType(node.right);
      
      if (leftType && rightType && leftType !== rightType) {
        errors.push({
          message: `Potential type mismatch: ${leftType} ${node.operator} ${rightType}`,
          severity: 'warning' as const,
          from: node.start,
          to: node.end,
          line: node.loc.start.line - 1,
          column: node.loc.start.column
        });
      }
    }
  };
  
  const getNodeType = (node: any): string | null => {
    if (node.type === 'Literal') {
      return typeof node.value;
    } else if (node.type === 'Identifier') {
      // TODO: 这里可以添加更复杂的类型推断逻辑
      return 'any';
    }
    return null;
  };
  
  esprima.parseScript(code, { tolerant: true, loc: true }, (node: any) => {
    walk(node);
    walkReferences(node);
    walkFunctionCalls(node);
    walkRedeclarations(node);
    walkTypeMismatch(node);
    leave(node);
  });

  const walkUnusedVars = (node: any) => {
    if (node.type === 'VariableDeclaration') {
      node.declarations.forEach((decl: any) => {
        if (decl.id.type === 'Identifier') {
          const varName = decl.id.name;
          const isUsed = scopeStack.some(scope => scope.has(varName));
          if (!isUsed) {
            errors.push({
              message: `Unused variable: ${varName}`,
              severity: 'suggestion' as const,
              from: node.start,
              to: node.end,
              line: node.loc.start.line - 1,
              column: node.loc.start.column
            });
          }
        }
      });
    }
  };

  esprima.parseScript(code, { tolerant: true, loc: true }, (node: any) => {
    walk(node);
    walkReferences(node);
    walkFunctionCalls(node);
    walkRedeclarations(node);
    walkTypeMismatch(node);
    walkUnusedVars(node);
    leave(node);
  });

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

  const asyncErrorRegex = /await\s+([^(\s)]+)/g;
  let asyncMatch;
  while ((asyncMatch = asyncErrorRegex.exec(code)) !== null) {
    if (!code.includes('async function') && !code.match(/\basync\s+\(/)) {
      errors.push({
        message: `Await used outside async function: ${asyncMatch[1]}`,
        severity: 'error' as const,
        from: asyncMatch.index,
        to: asyncMatch.index + asyncMatch[0].length,
        line: 0,
        category: 'syntax'
      });
    }
  }

  const blockScopeRedeclareRegex = /(let|const)\s+(\w+)\b[\s\S]*?\b(let|const)\s+\2\b/g;
  const redeclareRegex = blockScopeRedeclareRegex;
  let redeclareMatch;
  while ((redeclareMatch = redeclareRegex.exec(code)) !== null) {
    errors.push({
      message: `Redeclaration of block-scoped variable: ${redeclareMatch[2]}`,
      severity: 'error' as const,
      from: redeclareMatch.index,
      to: redeclareMatch.index + redeclareMatch[0].length,
      line: 0,
      category: 'semantic'
    });
  }

  const arrowFunctionParensRegex = /(\w+)\s*=>\s*{[\s\S]*?}/g;
  let arrowMatch;
  while ((arrowMatch = arrowFunctionParensRegex.exec(code)) !== null) {
    if (arrowMatch[1].includes(',')) {
      errors.push({
        message: `Arrow function with multiple parameters requires parentheses`,
        severity: 'error' as const,
        from: arrowMatch.index,
        to: arrowMatch.index + arrowMatch[0].length,
        line: 0,
        category: 'syntax'
      });
    }
  }

  const destructuringErrorRegex = /const\s+\{(\w+)\}\s*=\s*(\w+)(?!\s*\?\?)/g;
  const declaredVars = new Set(Array.from(scopeStack[0]));
  let destructuringMatch;
  while ((destructuringMatch = destructuringErrorRegex.exec(code)) !== null) {
    if (!declaredVars.has(destructuringMatch[2])) {
      errors.push({
        message: `Destructuring from undefined variable: ${destructuringMatch[2]}`,
        severity: 'error' as const,
        from: destructuringMatch.index,
        to: destructuringMatch.index + destructuringMatch[0].length,
        line: 0,
        category: 'semantic'
      });
    }
  }

  const allErrors = [...errors, ...tsErrors].filter(error =>
    !ignorePatterns.some(pattern => error.message.includes(pattern))
  );

  const result = {
    errors: allErrors,
    diagnostics: allErrors,
    stats: {
      errorCount: allErrors.filter(e => e.severity === 'error').length,
      warningCount: allErrors.filter(e => e.severity === 'warning').length,
      suggestionCount: allErrors.filter(e => e.severity === 'suggestion').length,
      syntaxErrorCount: allErrors.filter(e => e.category === 'syntax').length,
      semanticErrorCount: allErrors.filter(e => e.category === 'semantic').length,
      typeErrorCount: allErrors.filter(e => e.category === 'type').length
    },
    map: (fn: (error: any) => any) => allErrors.map(fn)
  };
  console.log('JS Checker Result:', result);
  return result;
};