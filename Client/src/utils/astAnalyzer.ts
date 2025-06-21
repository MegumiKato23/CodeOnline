interface VariableInfo {
  name: string
  type: string
  position: number
}

export const analyzeAST = (code: string): VariableInfo[] => {
  // 简化的AST分析实现
  const variables: VariableInfo[] = []
  
  // 匹配 const/let/var 声明
  const declRegex = /(?:const|let|var)\s+(\w+)/g
  let match
  while ((match = declRegex.exec(code)) !== null) {
    variables.push({
      name: match[1],
      type: 'unknown',
      position: match.index
    })
  }

  // 匹配函数声明
  const funcRegex = /function\s+(\w+)\s*\(/g
  while ((match = funcRegex.exec(code)) !== null) {
    variables.push({
      name: match[1],
      type: 'function',
      position: match.index
    })
  }

  return variables
}