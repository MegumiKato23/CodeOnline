import { Completion, CompletionContext } from '@codemirror/autocomplete'
import { analyzeAST } from '../astAnalyzer'

const JS_KEYWORDS: Completion[] = [
 // 控制结构
    { label: "if", type: "keyword", apply: "if ($0) {\n\t$1\n}", boost: 10 },
    { label: "else", type: "keyword", apply: "else {\n\t$0\n}", boost: 10 },
    { label: "for", type: "keyword", apply: "for (let i = 0; i < $1; i++) {\n\t$0\n}", boost: 10 },
    { label: "while", type: "keyword", apply: "while ($0) {\n\t$1\n}", boost: 9 },
    { label: "switch", type: "keyword", apply: "switch ($0) {\n\tcase $1:\n\t\t$2\n\t\tbreak;\n\tdefault:\n\t\t$3\n}", boost: 9 },
    { label: "try", type: "keyword", apply: "try {\n\t$0\n} catch (e) {\n\t$1\n}", boost: 9 },
    
    // 变量声明
    { label: "const", type: "keyword", apply: "const $0 = $1", boost: 10 },
    { label: "let", type: "keyword", apply: "let $0 = $1", boost: 10 },
    { label: "var", type: "keyword", apply: "var $0 = $1", boost: 8 },
    
    // 函数
    { label: "function", type: "keyword", apply: "function $0($1) {\n\t$2\n}", boost: 10 },
    { label: "return", type: "keyword", apply: "return $0", boost: 10 },
    { label: "async", type: "keyword", apply: "async function $0($1) {\n\t$2\n}", boost: 9 },
    { label: "await", type: "keyword", apply: "await $0", boost: 9 },
    
    // 类
    { label: "class", type: "keyword", apply: "class $0 {\n\tconstructor($1) {\n\t\t$2\n\t}\n}", boost: 9 },
    { label: "extends", type: "keyword", apply: "extends $0", boost: 9 },
    
    // DOM操作
    { label: "document.querySelector", type: "function", apply: "document.querySelector('$0')", boost: 10 },
    { label: "document.querySelectorAll", type: "function", apply: "document.querySelectorAll('$0')", boost: 9 },
    { label: "addEventListener", type: "function", apply: "addEventListener('$0', $1)", boost: 9 },
    
    // 控制台
    { label: "console.log", type: "function", apply: "console.log($0)", boost: 10 },
    { label: "console.error", type: "function", apply: "console.error($0)", boost: 9 },
    { label: "console.warn", type: "function", apply: "console.warn($0)", boost: 9 },
    
    // 常用方法
    { label: "setTimeout", type: "function", apply: "setTimeout(() => {\n\t$0\n}, $1)", boost: 9 },
    { label: "setInterval", type: "function", apply: "setInterval(() => {\n\t$0\n}, $1)", boost: 9 },
    { label: "JSON.parse", type: "function", apply: "JSON.parse($0)", boost: 9 },
    { label: "JSON.stringify", type: "function", apply: "JSON.stringify($0)", boost: 9 },
    
    // ES6+特性
    { label: "Promise", type: "class", apply: "new Promise((resolve, reject) => {\n\t$0\n})", boost: 9 },
    { label: "fetch", type: "function", apply: "fetch('$0')", boost: 9 },
    { label: "import", type: "keyword", apply: "import $0 from '$1'", boost: 9 },
    { label: "export", type: "keyword", apply: "export $0", boost: 9 }
]

export const jsCompletions = (context: CompletionContext) => {
  const { state, pos } = context
  const userVars = analyzeAST(state.doc.toString())
  
  return {
    from: pos,
    options: [
      ...JS_KEYWORDS,
      ...userVars.map(v => ({ label: v.name, type: "variable", detail: v.type }))
    ]
  }
}