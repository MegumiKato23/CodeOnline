import * as ts from 'typescript';
import { Completion, CompletionContext } from '@codemirror/autocomplete';
import { analyzeAST, type VariableInfo } from './astAnalyzer';
const GLOBAL_OBJECTS: Completion[] = [
  { label: "console", type: "variable", detail: "Global object" },
  { label: "document", type: "variable", detail: "Global object" }
]

const JS_KEYWORDS: Completion[] = [
 // 控制流关键字
    { label: "if", type: "keyword", apply: "if () {\n\t\n}", boost: 10 },
    { label: "else", type: "keyword", apply: "else {\n\t\n}", boost: 10 },
    { label: "for", type: "keyword", apply: "for (let i = 0; i < ; i++) {\n\t\n}", boost: 10 },
    { label: "while", type: "keyword", apply: "while () {\n\t\n}", boost: 9 },
    { label: "switch", type: "keyword", apply: "switch () {\n\tcase :\n\t\t\n\t\tbreak;\n\tdefault:\n\t\t\n}", boost: 9 },
    { label: "try", type: "keyword", apply: "try {\n\t\n} catch (e) {\n\t\n}", boost: 9 },
    
    // 变量声明关键字
    { label: "const", type: "keyword", apply: "const  = ", boost: 10 },
    { label: "let", type: "keyword", apply: "let  = ", boost: 10 },
    { label: "var", type: "keyword", apply: "var  = ", boost: 8 },
    
    // 函数相关关键字
    { label: "function", type: "keyword", apply: "function () {\n\t\n}", boost: 10 },
    { label: "return", type: "keyword", apply: "return ", boost: 10 },
    { label: "async", type: "keyword", apply: "async function () {\n\t\n}", boost: 9 },
    { label: "await", type: "keyword", apply: "await ", boost: 9 },
    
    // 类相关关键字
    { label: "class", type: "keyword", apply: "class  {\n\tconstructor() {\n\t\t\n\t}\n}", boost: 9 },
    { label: "extends", type: "keyword", apply: "extends ", boost: 9 },
    
    // DOM操作方法
    { label: "document.querySelector", type: "function", apply: "document.querySelector('')", boost: 10 },
    { label: "document.querySelectorAll", type: "function", apply: "document.querySelectorAll('')", boost: 9 },
    { label: "addEventListener", type: "function", apply: "addEventListener('', )", boost: 9 },
    
    // 控制台方法
    { label: "console.log", type: "function", apply: "console.log()", boost: 10 },
    { label: "console.error", type: "function", apply: "console.error()", boost: 9 },
    { label: "console.warn", type: "function", apply: "console.warn()", boost: 9 },
    
    // 常用全局方法
    { label: "setTimeout", type: "function", apply: "setTimeout(() => {\n\t\n}, )", boost: 9 },
    { label: "setInterval", type: "function", apply: "setInterval(() => {\n\t\n}, )", boost: 9 },
    { label: "JSON.parse", type: "function", apply: "JSON.parse()", boost: 9 },
    { label: "JSON.stringify", type: "function", apply: "JSON.stringify()", boost: 9 },
    
    // ES6+
    { label: "Promise", type: "class", apply: "new Promise((resolve, reject) => {\n\t\n})", boost: 9 },
    { label: "fetch", type: "function", apply: "fetch('')", boost: 9 },
    { label: "import", type: "keyword", apply: "import  from ''", boost: 9 },
    { label: "export", type: "keyword", apply: "export ", boost: 9 }
]
// 框架API (Vue/React/Svelte)
const FRAME_APIS: Record<string, Completion[]> = {
  "vue": [
    { label: "ref", apply: "ref()", boost: 10, info: "Vue reactive reference" },
    { label: "computed", apply: "computed(() => )", boost: 9, info: "Vue computed property" },
    { label: "reactive", apply: "reactive()", boost: 9, info: "Vue reactive object" },
    { label: "watch", apply: "watch(, () => {\n\t\n})", boost: 9, info: "Vue watcher" },
    { label: "onMounted", apply: "onMounted(() => {\n\t\n})", boost: 8, info: "Vue lifecycle hook" },
    { label: "onUpdated", apply: "onUpdated(() => {\n\t\n})", boost: 8, info: "Vue lifecycle hook" },
    { label: "onUnmounted", apply: "onUnmounted(() => {\n\t\n})", boost: 8, info: "Vue lifecycle hook" },
    { label: "provide", apply: "provide(, )", boost: 8, info: "Vue dependency injection" },
    { label: "inject", apply: "inject()", boost: 8, info: "Vue dependency injection" },
    { label: "nextTick", apply: "nextTick(() => {\n\t\n})", boost: 8, info: "Vue next DOM update" }
  ],
  "react": [
    { label: "useState", apply: "const [, set] = useState()", boost: 10, info: "React state hook" },
    { label: "useEffect", apply: "useEffect(() => {\n\t\n}, [])", boost: 10, info: "React side effect hook" },
    { label: "useContext", apply: "useContext()", boost: 9, info: "React context hook" },
    { label: "useReducer", apply: "useReducer(, )", boost: 9, info: "React reducer hook" },
    { label: "useCallback", apply: "useCallback(() => {\n\t\n}, [])", boost: 9, info: "React callback hook" },
    { label: "useMemo", apply: "useMemo(() => , [])", boost: 9, info: "React memo hook" },
    { label: "useRef", apply: "useRef()", boost: 9, info: "React ref hook" },
    { label: "useLayoutEffect", apply: "useLayoutEffect(() => {\n\t\n}, [])", boost: 8, info: "React layout effect hook" },
    { label: "useImperativeHandle", apply: "useImperativeHandle(, () => {\n\t\n}, [])", boost: 8, info: "React imperative handle hook" },
    { label: "useDebugValue", apply: "useDebugValue()", boost: 7, info: "React debug hook" }
  ],
  "svelte": [
    { label: "onMount", apply: "onMount(() => {\n\t\n})", boost: 9, info: "Svelte lifecycle hook" },
    { label: "onDestroy", apply: "onDestroy(() => {\n\t\n})", boost: 8, info: "Svelte lifecycle hook" },
    { label: "beforeUpdate", apply: "beforeUpdate(() => {\n\t\n})", boost: 8, info: "Svelte lifecycle hook" },
    { label: "afterUpdate", apply: "afterUpdate(() => {\n\t\n})", boost: 8, info: "Svelte lifecycle hook" },
    { label: "tick", apply: "tick().then(() => {\n\t\n})", boost: 8, info: "Svelte DOM update" }
  ]
};
// 将变量信息映射为补全项
const mapVariableToCompletion = (v: VariableInfo): Completion => ({
  label: v.name,
  type: v.type === 'function' ? 'function' : 
        v.type === 'class' ? 'class' : 'variable',
  detail: `${v.type}${v.scope ? ` (${v.scope})` : ''}`
})

export const jsCompletions = (context: CompletionContext, projectContext?: any) =>{
  const code = context.state.doc.toString();
  const position = context.pos;

  // 使用 TypeScript 解析源码
  const sourceFile = ts.createSourceFile('file.ts', code, ts.ScriptTarget.Latest, true);

  // 简单示例：获取所有顶层变量名
  const identifiers: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && node.name.kind === ts.SyntaxKind.Identifier) {
      identifiers.push(node.name.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  // 结合 analyzeAST 结果
  // 获取当前光标前的词
  const line = context.state.doc.lineAt(position);
  const textBefore = line.text.slice(0, position - line.from);

  const identifierMatch = /([a-zA-Z_$][0-9a-zA-Z_$]*)$/.exec(textBefore);
  if (identifierMatch) {
    const prefix = identifierMatch[1];
    const userVars: VariableInfo[] = analyzeAST(context.state.doc.toString());

    return {
      from: context.pos - prefix.length,
      options: [
        ...JS_KEYWORDS.filter(k => 
          k.label.startsWith(prefix) &&
          !k.label.endsWith(":")
        ),
        ...userVars.filter((v: VariableInfo) => 
          v.name && v.name.startsWith(prefix)
        ).map(v => ({
          label: v.name,
          type: v.type === 'function' ? 'function' : 
                v.type === 'class' ? 'class' : 'variable',
          detail: v.type
        })),
        ...GLOBAL_OBJECTS.filter(obj => obj.label.startsWith(prefix))
      ],
      filter: false
    };
  }

  // 2. 处理成员表达式补全，例如 console.l 补全为 log
  const memberExprMatch = /([a-zA-Z_$][\w$]*)\.([\w$]*)$/.exec(textBefore)
  if (memberExprMatch) {
    const [_, obj, prop] = memberExprMatch
    const objCompletions = getObjectCompletions(obj) 
    if (objCompletions.length) {
      return {
        from: context.pos - prop.length,
        options: objCompletions.filter(c => 
          c.label.startsWith(prop)
        ),
        filter: false
      }
    }

    return {
      from: context.pos - prop.length,
      options: objCompletions.filter(c => 
        c.label.startsWith(prop)
      ),
      filter: false
    }
  }
  // 处理普通标识符补全
  const prefix = identifierMatch ? identifierMatch[1] : '';
if (!prefix) return null;

const userVars = analyzeAST(context.state.doc.toString()) as VariableInfo[];

return {
  from: position - prefix.length,
  options: [
    ...userVars.filter(v => v.name.startsWith(prefix)).map(v => ({
      label: v.name,
      type: v.type === 'function' ? 'function' : v.type === 'class' ? 'class' : 'variable',
      detail: v.type.toUpperCase()
    })),
    ...identifiers.filter(id => id.startsWith(prefix)).map(id => ({
      label: id,
      type: 'variable',
      detail: 'TS Identifier'
    })),
    ...JS_KEYWORDS.filter(k => k.label.startsWith(prefix))
  ],
  filter: false
}

// 获取对象属性补全
function getObjectCompletions(obj: string): Completion[] {
  const OBJ_PROPS: Record<string, Completion[]> = {
    console: [
      { label: "log", type: "method", apply: "log()" },
      { label: "error", type: "method", apply: "error()" }
    ],
    document: [
      { label: "querySelector", type: "method", apply: "querySelector('')" }
    ]
  };
  return OBJ_PROPS[obj] || [];
}
}