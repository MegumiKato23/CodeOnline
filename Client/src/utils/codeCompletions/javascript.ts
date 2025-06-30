import * as ts from 'typescript';
import { Completion, CompletionContext } from '@codemirror/autocomplete';
import { analyzeAST, type VariableInfo } from '../astAnalyzer';
const GLOBAL_OBJECTS: Completion[] = [
  { label: "console", type: "variable", detail: "Global object" },
  { label: "document", type: "variable", detail: "Global object" }
]

const JS_KEYWORDS: Completion[] = [
 // �1�7�1�7�1�7�0�9�5�5
    { label: "if", type: "keyword", apply: "if ($0) {\n\t$1\n}", boost: 10 },
    { label: "else", type: "keyword", apply: "else {\n\t$0\n}", boost: 10 },
    { label: "for", type: "keyword", apply: "for (let i = 0; i < $1; i++) {\n\t$0\n}", boost: 10 },
    { label: "while", type: "keyword", apply: "while ($0) {\n\t$1\n}", boost: 9 },
    { label: "switch", type: "keyword", apply: "switch ($0) {\n\tcase $1:\n\t\t$2\n\t\tbreak;\n\tdefault:\n\t\t$3\n}", boost: 9 },
    { label: "try", type: "keyword", apply: "try {\n\t$0\n} catch (e) {\n\t$1\n}", boost: 9 },
    
    // �1�7�1�7�1�7�1�7�1�7�1�7�1�7�1�7
    { label: "const", type: "keyword", apply: "const $0 = $1", boost: 10 },
    { label: "let", type: "keyword", apply: "let $0 = $1", boost: 10 },
    { label: "var", type: "keyword", apply: "var $0 = $1", boost: 8 },
    
    // �1�7�1�7�1�7�1�7
    { label: "function", type: "keyword", apply: "function $0($1) {\n\t$2\n}", boost: 10 },
    { label: "return", type: "keyword", apply: "return $0", boost: 10 },
    { label: "async", type: "keyword", apply: "async function $0($1) {\n\t$2\n}", boost: 9 },
    { label: "await", type: "keyword", apply: "await $0", boost: 9 },
    
    // �1�7�1�7
    { label: "class", type: "keyword", apply: "class $0 {\n\tconstructor($1) {\n\t\t$2\n\t}\n}", boost: 9 },
    { label: "extends", type: "keyword", apply: "extends $0", boost: 9 },
    
    // DOM�1�7�1�7�1�7�1�7
    { label: "document.querySelector", type: "function", apply: "document.querySelector('$0')", boost: 10 },
    { label: "document.querySelectorAll", type: "function", apply: "document.querySelectorAll('$0')", boost: 9 },
    { label: "addEventListener", type: "function", apply: "addEventListener('$0', $1)", boost: 9 },
    
    // �1�7�1�7�1�7�1�7�0�6
    { label: "console.log", type: "function", apply: "console.log($0)", boost: 10 },
    { label: "console.error", type: "function", apply: "console.error($0)", boost: 9 },
    { label: "console.warn", type: "function", apply: "console.warn($0)", boost: 9 },
    
    // �1�7�1�7�1�7�1�7�1�7�1�7
    { label: "setTimeout", type: "function", apply: "setTimeout(() => {\n\t$0\n}, $1)", boost: 9 },
    { label: "setInterval", type: "function", apply: "setInterval(() => {\n\t$0\n}, $1)", boost: 9 },
    { label: "JSON.parse", type: "function", apply: "JSON.parse($0)", boost: 9 },
    { label: "JSON.stringify", type: "function", apply: "JSON.stringify($0)", boost: 9 },
    
    // ES6+�1�7�1�7�1�7�1�7
    { label: "Promise", type: "class", apply: "new Promise((resolve, reject) => {\n\t$0\n})", boost: 9 },
    { label: "fetch", type: "function", apply: "fetch('$0')", boost: 9 },
    { label: "import", type: "keyword", apply: "import $0 from '$1'", boost: 9 },
    { label: "export", type: "keyword", apply: "export $0", boost: 9 }
]
// �1�7�1�7�1�7�1�7�1�7�1�7API�1�7�1�7�1�7�1�7Vue/React�1�7�1�7
const FRAME_APIS: Record<string, Completion[]> = {
  "vue": [
    { label: "ref", apply: "ref($0)", boost: 10, info: "Vue reactive reference" },
    { label: "computed", apply: "computed(() => $0)", boost: 9, info: "Vue computed property" },
    { label: "reactive", apply: "reactive($0)", boost: 9, info: "Vue reactive object" },
    { label: "watch", apply: "watch($0, () => {\n\t$1\n})", boost: 9, info: "Vue watcher" },
    { label: "onMounted", apply: "onMounted(() => {\n\t$0\n})", boost: 8, info: "Vue lifecycle hook" },
    { label: "onUpdated", apply: "onUpdated(() => {\n\t$0\n})", boost: 8, info: "Vue lifecycle hook" },
    { label: "onUnmounted", apply: "onUnmounted(() => {\n\t$0\n})", boost: 8, info: "Vue lifecycle hook" },
    { label: "provide", apply: "provide($0, $1)", boost: 8, info: "Vue dependency injection" },
    { label: "inject", apply: "inject($0)", boost: 8, info: "Vue dependency injection" },
    { label: "nextTick", apply: "nextTick(() => {\n\t$0\n})", boost: 8, info: "Vue next DOM update" }
  ],
  "react": [
    { label: "useState", apply: "const [$0, set${0/(.*)/${1:/capitalize}/}] = useState($1)", boost: 10, info: "React state hook" },
    { label: "useEffect", apply: "useEffect(() => {\n\t$0\n}, [$1])", boost: 10, info: "React side effect hook" },
    { label: "useContext", apply: "useContext($0)", boost: 9, info: "React context hook" },
    { label: "useReducer", apply: "useReducer($0, $1)", boost: 9, info: "React reducer hook" },
    { label: "useCallback", apply: "useCallback(() => {\n\t$0\n}, [$1])", boost: 9, info: "React callback hook" },
    { label: "useMemo", apply: "useMemo(() => $0, [$1])", boost: 9, info: "React memo hook" },
    { label: "useRef", apply: "useRef($0)", boost: 9, info: "React ref hook" },
    { label: "useLayoutEffect", apply: "useLayoutEffect(() => {\n\t$0\n}, [$1])", boost: 8, info: "React layout effect hook" },
    { label: "useImperativeHandle", apply: "useImperativeHandle($0, () => {\n\t$1\n}, [$2])", boost: 8, info: "React imperative handle hook" },
    { label: "useDebugValue", apply: "useDebugValue($0)", boost: 7, info: "React debug hook" }
  ],
  "svelte": [
    { label: "onMount", apply: "onMount(() => {\n\t$0\n})", boost: 9, info: "Svelte lifecycle hook" },
    { label: "onDestroy", apply: "onDestroy(() => {\n\t$0\n})", boost: 8, info: "Svelte lifecycle hook" },
    { label: "beforeUpdate", apply: "beforeUpdate(() => {\n\t$0\n})", boost: 8, info: "Svelte lifecycle hook" },
    { label: "afterUpdate", apply: "afterUpdate(() => {\n\t$0\n})", boost: 8, info: "Svelte lifecycle hook" },
    { label: "tick", apply: "tick().then(() => {\n\t$0\n})", boost: 8, info: "Svelte DOM update" }
  ]
};
// �1�7�1�7�1�7�0�8�1�7�0�0�1�7�0�4�1�7�0�0�0�5�1�7�1�7�0�8�1�7�1�7
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

  // 2. �1�7�1�7�1�7�1�7�1�7�1�7�1�7�0�4�1�7�0�0�1�7�1�7�1�7�1�7�1�7�1�7 console.l �1�7�1�7�0�0 log�1�7�1�7
  const memberExprMatch = /([a-zA-Z_$][\w$]*)\.([\w$]*)$/.exec(textBefore)
  if (memberExprMatch) {
    const [_, obj, prop] = memberExprMatch
    const objCompletions = getObjectCompletions(obj) // �1�7�0�8�1�7�1�7��1�7�1�7�1�7�1�7�0�0�1�7�1�7�1�7�1�7�1�7�1�7�1�7�1�7
    
    return {
      from: context.pos - prop.length,
      options: objCompletions.filter(c => 
        c.label.startsWith(prop)
      ),
      filter: false
    }
  }
  // �1�7�1�0�0�4�1�7�0�0�0�5�1�7�1�7�1�7�1�7�1�7�1�7�1�7�1�8�1�7
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

// �0�5�1�7�1�7�1�7�1�7�1�7�1�7�1�7�1�7�1�7�1�7
function getObjectCompletions(obj: string): Completion[] {
  const OBJ_PROPS: Record<string, Completion[]> = {
    console: [
      { label: "log", type: "method", apply: "log($0)" },
      { label: "error", type: "method", apply: "error($0)" }
    ],
    document: [
      { label: "querySelector", type: "method", apply: "querySelector('$0')" }
    ]
  };
  return OBJ_PROPS[obj] || [];
}
}
