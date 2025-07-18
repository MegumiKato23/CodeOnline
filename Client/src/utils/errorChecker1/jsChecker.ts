import { CodeError, ErrorChecker, ErrorCheckerOptions } from './typescript';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { base } from 'acorn-walk';

export const jsChecker: ErrorChecker = async (code: string, options?: ErrorCheckerOptions) => {
  const errors: CodeError[] = [];

  let ast;
  try {
    ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'module', locations: true });
  } catch (e: any) {
    errors.push({
      message: e.message,
      severity: 'error',
      from: e.pos || 0,
      to: e.pos ? e.pos + 1 : 1,
      line: e.loc ? e.loc.line - 1 : 0,
      column: e.loc ? e.loc.column : 0,
    });
    return {
      errors,
      diagnostics: errors,
      stats: {
        errorCount: errors.length,
        warningCount: 0,
        suggestionCount: 0,
      },
      map: (fn: (error: any) => any) => errors.map(fn),
    };
  }

  const scopeStack: Array<Set<string>> = [new Set()];
  const declaredVars = new Map<string, any>(); // 变量名 -> 声明节点
  const usedVars = new Map<string, any>(); // 变量名 -> 使用节点

  function enterScope() {
    scopeStack.push(new Set());
  }
  function exitScope() {
    scopeStack.pop();
  }
  function declareVar(name: string, node: any) {
    const currentScope = scopeStack[scopeStack.length - 1];
    if (currentScope.has(name)) {
      errors.push({
        message: `Variable '${name}' is already declared in the current scope.`,
        severity: 'error',
        from: node.start,
        to: node.end,
        line: node.loc.start.line - 1,
        column: node.loc.start.column,
      });
    } else {
      currentScope.add(name);
      declaredVars.set(name, node);
    }
  }

  walk.recursive(ast, null, {
    VariableDeclaration(node: any, state: any, c: any) {
      if (node.kind === 'let' || node.kind === 'const') {
        enterScope();
      }
      node.declarations.forEach((decl: any) => {
        if (decl.id.type === 'Identifier') {
          declareVar(decl.id.name, decl);
        }
      });
      for (const decl of node.declarations) {
        c(decl, state);
      }
      if (node.kind === 'let' || node.kind === 'const') {
        exitScope();
      }
    },
    FunctionDeclaration(node: any, state: any, c: any) {
      declareVar(node.id.name, node);
      enterScope();
      node.params.forEach((param: any) => {
        if (param.type === 'Identifier') {
          declareVar(param.name, param);
        }
      });
      for (const param of node.params) {
        c(param, state);
      }
      c(node.body, state);
      exitScope();
    },
    BlockStatement(node: any, state: any, c: any) {
      enterScope();
      for (const stmt of node.body) {
        c(stmt, state);
      }
      exitScope();
    },
    Identifier(node: any, state: any, c: any) {
      // 过滤掉声明时的 Identifier，避免重复计数
      if (state !== 'declaration') {
        usedVars.set(node.name, node);
      }
    },
    DebuggerStatement(node: any, state: any, c: any) {
      errors.push({
        message: `Unexpected 'debugger' statement.`,
        severity: 'error',
        from: node.start,
        to: node.end,
        line: node.loc.start.line - 1,
        column: node.loc.start.column,
      });
    },
    ...base,
  });

  // 检测未定义变量
  usedVars.forEach((node, name) => {
    if (!declaredVars.has(name) && name !== 'console' && name !== 'window' && name !== 'document') {
      errors.push({
        message: `Variable '${name}' is not defined.`,
        severity: 'error',
        from: node.start,
        to: node.end,
        line: node.loc.start.line - 1,
        column: node.loc.start.column,
      });
    }
  });

  // 检测未使用变量
  declaredVars.forEach((node, name) => {
    if (!usedVars.has(name)) {
      errors.push({
        message: `Variable '${name}' is declared but its value is never read.`,
        severity: 'warning',
        from: node.start,
        to: node.end,
        line: node.loc.start.line - 1,
        column: node.loc.start.column,
      });
    }
  });

  const ignorePatterns = options?.ignorePatterns || [];
  const filteredErrors = errors.filter((error) => !ignorePatterns.some((pattern) => error.message.includes(pattern)));

  return {
    errors: filteredErrors,
    diagnostics: filteredErrors,
    stats: {
      errorCount: filteredErrors.filter((e) => e.severity === 'error').length,
      warningCount: filteredErrors.filter((e) => e.severity === 'warning').length,
      suggestionCount: filteredErrors.filter((e) => e.severity === 'suggestion').length,
    },
    map: (fn: (error: any) => any) => filteredErrors.map(fn),
  };
};
