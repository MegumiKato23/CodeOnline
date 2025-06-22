import { Completion, CompletionContext } from '@codemirror/autocomplete'
import { analyzeAST, type VariableInfo } from '../astAnalyzer'
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
// 补充框架API（如Vue/React）
const FRAME_APIS: Record<string, Completion[]> = {
  "vue": [
    { label: "ref", apply: "ref($0)" },
    { label: "computed", apply: "computed(() => $0)" }
  ],
  "react": [
    { label: "useState", apply: "const [$0, set${0/(.*)/${1:/capitalize}/}] = useState()" }
  ]
};
// 类型安全的补全选项转换
const mapVariableToCompletion = (v: VariableInfo): Completion => ({
  label: v.name,
  type: v.type === 'function' ? 'function' : 
        v.type === 'class' ? 'class' : 'variable',
  detail: `${v.type}${v.scope ? ` (${v.scope})` : ''}`
})

export const jsCompletions = (context: CompletionContext) => {
  const line = context.state.doc.lineAt(context.pos)
  const textBefore = line.text.slice(0, context.pos - line.from)
  
  // 1. 标识符补全（输入 docu 补全 document）
  const identifierMatch = /([a-zA-Z_$][0-9a-zA-Z_$]*)$/.exec(textBefore)
  if (identifierMatch) {
    const prefix = identifierMatch[1]
    const userVars = analyzeAST(context.state.doc.toString())
    
    return {
      from: context.pos - prefix.length,
      options: [
        ...JS_KEYWORDS.filter(k => 
          k.label.startsWith(prefix) &&
          !k.label.endsWith(":")
        ),
        ...userVars.filter(v => 
          v.name.startsWith(prefix)
        ).map(v => ({
          label: v.name,
          type: "variable",
          detail: v.type
        }))
      ],
      filter: false
    }
  }

  // 2. 对象属性补全（输入 console.l 补全 log）
  const memberExprMatch = /([a-zA-Z_$][\w$]*)\.([\w$]*)$/.exec(textBefore)
  if (memberExprMatch) {
    const [_, obj, prop] = memberExprMatch
    const objCompletions = getObjectCompletions(obj) // 自定义函数获取对象属性
    
    return {
      from: context.pos - prop.length,
      options: objCompletions.filter(c => 
        c.label.startsWith(prop)
      ),
      filter: false
    }
  }
  // 修改补全选项生成逻辑
  const userVars = analyzeAST(context.state.doc.toString())
    .filter(v => v.position < context.pos) // 只使用当前位置之前的变量
    .map(v => ({
      label: v.name,
      type: v.type === 'function' ? 'function' : 
            v.type === 'class' ? 'class' : 'variable',
      detail: v.type.toUpperCase() // 显示更详细的类型信息
    }))
  return {
    from: context.pos,
    options: [...JS_KEYWORDS, ...userVars],
    filter: false
  }
}

// 示例辅助函数
function getObjectCompletions(obj: string): Completion[] {
  const OBJ_PROPS: Record<string, Completion[]> = {
    console: [
      { label: "log", type: "method", apply: "log($0)" },
      { label: "error", type: "method", apply: "error($0)" }
    ],
    document: [
      { label: "querySelector", type: "method", apply: "querySelector('$0')" }
    ]
  }
  return OBJ_PROPS[obj] || []
}