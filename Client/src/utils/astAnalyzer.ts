export interface VariableInfo {
  name: string
  type: 'variable' | 'function' | 'class' | 'component' | 'unknown'
  position: number
  scope: 'global' | 'function' | 'block' | 'class'
  returnType?: string
  isExported?: boolean
  isAsync?: boolean // 标记是否为异步函数
  isArrow?: boolean // 标记是否为箭头函数
  params?: string[] // 函数参数列表
  generics?: string[] // 泛型类型参数
  extends?: string // 类继承类型
}

export const analyzeAST = (code: string): VariableInfo[] => {
  const variables: VariableInfo[] = []
  const scopeStack: string[] = ['global']
  let currentFunction: string | null = null
  let currentClass: string | null = null
  let currentGenerics: string[] = []
  
  // 1. �������� (const/let/var) - ��ǿ���������
  const varRegex = /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)(?:\s*:\s*(\w+))?/g
  let varMatch: RegExpExecArray | null
  while ((varMatch = varRegex.exec(code)) !== null) {
    variables.push({
      name: varMatch[1],
      type: 'variable',
      position: varMatch.index,
      scope: scopeStack[scopeStack.length - 1] as 'global' | 'function' | 'block' | 'class',
      returnType: varMatch[2] || undefined,
      isExported: code.slice(varMatch.index - 7, varMatch.index).includes('export')
    })
  }

  // 函数声明分析
  const funcRegex = /(async\s+)?function\s+([a-zA-Z_$][\w$]*)\s*<([^>]+)>?\s*\(([^)]*)\)\s*(?::\s*(\w+))?/g
  let funcMatch: RegExpExecArray | null
  while ((funcMatch = funcRegex.exec(code)) !== null) {
    const isAsync = !!funcMatch[1]
    const generics = funcMatch[3] ? funcMatch[3].split(',').map(s => s.trim()) : []
    const params = funcMatch[4] ? funcMatch[4].split(',').map(s => s.trim().split(/\s*:\s*/)[0]) : []
    
    variables.push({
      name: funcMatch[2],
      type: 'function',
      position: funcMatch.index,
      scope: 'global',
      returnType: funcMatch[5] || undefined,
      isExported: code.slice(funcMatch.index - 7, funcMatch.index).includes('export'),
      isAsync,
      params,
      generics
    })
    currentFunction = funcMatch[2]
    currentGenerics = generics
    scopeStack.push('function')
  }

  // 类声明分析
  const classRegex = /class\s+([a-zA-Z_$][\w$]*)\s*(?:<([^>]+)>)?\s*(?:extends\s+([a-zA-Z_$][\w$]*))?/g
  let classMatch: RegExpExecArray | null
  while ((classMatch = classRegex.exec(code)) !== null) {
    const generics = classMatch[2] ? classMatch[2].split(',').map(s => s.trim()) : []
    const extendsClass = classMatch[3] || undefined
    
    variables.push({
      name: classMatch[1],
      type: 'class',
      position: classMatch.index,
      scope: 'global',
      isExported: code.slice(classMatch.index - 7, classMatch.index).includes('export'),
      generics,
      extends: extendsClass
    })
    currentClass = classMatch[1]
    currentGenerics = generics
  }

  // React组件分析
  const componentRegex = /const\s+([a-zA-Z_$][\w$]*)\s*:\s*(\w+)\s*(?:<([^>]+)>)?\s*=\s*\(([^)]*)\)\s*=>\s*</g
  let componentMatch: RegExpExecArray | null
  while ((componentMatch = componentRegex.exec(code)) !== null) {
    const generics = componentMatch[3] ? componentMatch[3].split(',').map(s => s.trim()) : []
    const params = componentMatch[4] ? componentMatch[4].split(',').map(s => s.trim().split(/\s*:\s*/)[0]) : []
    
    variables.push({
      name: componentMatch[1],
      type: 'component',
      position: componentMatch.index,
      scope: 'global',
      returnType: componentMatch[2] || 'JSX.Element',
      isExported: code.slice(componentMatch.index - 7, componentMatch.index).includes('export'),
      params,
      generics
    })
  }

  return variables
}


  
// 可��：添加缓存版本
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