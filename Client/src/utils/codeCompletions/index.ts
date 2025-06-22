import { autocompletion, Completion, CompletionContext } from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
import { htmlCompletions } from './html'
import { cssCompletions } from './css'
import { jsCompletions } from './javascript'

interface CachedData {
  html: {
    tags: any[]
    attributes: any[]
  }
  css: {
    properties: any[]
    values: any[]
  }
}

function sortCompletions(context: CompletionContext, options: Completion[]) {
  const prefix = context.state.doc.sliceString(
    Math.max(0, context.pos - 10),
    context.pos
  ).replace(/.*\W/, "");

  return options.sort((a, b) => {
    // 优先匹配前缀的项
    const aMatch = a.label.startsWith(prefix) ? 0 : 1;
    const bMatch = b.label.startsWith(prefix) ? 0 : 1;
    return aMatch - bMatch || (a.boost || 0) - (b.boost || 0);
  });
}

export const createCompletions = () => {
  let cached: CachedData = {
    html: { tags: [], attributes: [] },
    css: { properties: [], values: [] }
  }

  return autocompletion({
    override: [
      (context: CompletionContext) => {
        const lang = getActiveLang(context)
        switch(lang) {
          case 'html': 
            return htmlCompletions(context)
          case 'css': 
            return cssCompletions(context)
          case 'js': 
            return jsCompletions(context)
          default: 
            return null
        }
      }
    ]
  })
}

// 确保所有代码都在函数或模块作用域内，不要有游离的 return 语句
function getActiveLang(context: CompletionContext): 'html' | 'css' | 'js' {
  const tree = syntaxTree(context.state)
  const node = tree.resolveInner(context.pos, -1)
  // 优先根据当前激活的标签判断
  const editorState = context.state as any;
  if (editorState?.activeTab) {
    return editorState.activeTab;
  }

  // 备用方案：基于内容分析
  const line = context.state.doc.lineAt(context.pos);
  const textBefore = line.text.slice(0, context.pos - line.from);
  
  // HTML检测：以<开头且未闭合
  if (/<[a-z]*$/i.test(textBefore)) return 'html';
  
  // CSS检测：包含选择器或属性
  if (/(^|\}|\{)[^\{]*$/.test(textBefore) && /:\s*[^;]*$/.test(textBefore)) return 'css';
  
  // 默认JS
  // 新增 JSX 检测
  if (node.name.includes('JsxElement')) return 'html'
  if (node.name.includes('Rule') || node.name.includes('Declaration')) return 'css'
  return 'js'
}