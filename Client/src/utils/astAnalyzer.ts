export interface VariableInfo {
  name: string
  type: 'variable' | 'function' | 'class' | 'component' | 'unknown'
  position: number
  scope?: 'global' | 'function' | 'block' // 可选作用域信息
}

export const analyzeAST = (code: string): VariableInfo[] => {
  const variables: VariableInfo[] = []
  
  // 1. 匹配变量声明 (const/let/var)
  const varRegex = /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)/g
  let varMatch: RegExpExecArray | null
  while ((varMatch = varRegex.exec(code)) !== null) {
    variables.push({
      name: varMatch[1],
      type: 'variable',
      position: varMatch.index
    })
  }

  // 2. 匹配函数声明 (function)
  const funcRegex = /function\s+([a-zA-Z_$][\w$]*)\s*\(/g
  let funcMatch: RegExpExecArray | null
  while ((funcMatch = funcRegex.exec(code)) !== null) {
    variables.push({
      name: funcMatch[1],
      type: 'function',
      position: funcMatch.index
    })
  }

  // 3. 匹配类声明 (class)
  const classRegex = /class\s+([a-zA-Z_$][\w$]*)/g
  let classMatch: RegExpExecArray | null
  while ((classMatch = classRegex.exec(code)) !== null) {
    variables.push({
      name: classMatch[1],
      type: 'class',
      position: classMatch.index
    })
  }

  // 4. 匹配React组件 (箭头函数返回JSX)
  const componentRegex = /const\s+([a-zA-Z_$][\w$]*)\s*=\s*\([^)]*\)\s*=>\s*</g
  let componentMatch: RegExpExecArray | null
  while ((componentMatch = componentRegex.exec(code)) !== null) {
    variables.push({
      name: componentMatch[1],
      type: 'component',
      position: componentMatch.index
    })
  }

  return variables
}


  
// 可选：添加缓存版本
let cachedCode = ''
let cachedResult: VariableInfo[] = []

export const cachedAnalyzeAST = (code: string): VariableInfo[] => {
  if (cachedCode === code) return cachedResult
  cachedCode = code
  cachedResult = analyzeAST(code)
  return cachedResult
}
let currentScope = 'global'
const scopeStack: string[] = []