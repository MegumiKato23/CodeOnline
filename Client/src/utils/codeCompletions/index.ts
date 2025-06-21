import { autocompletion, CompletionContext } from '@codemirror/autocomplete'
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
            return htmlCompletions(context) // 移除第二个参数
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

function getActiveLang(context: CompletionContext): 'html' | 'css' | 'js' {
  // 简单的语言检测逻辑
  var lineText = context.state.doc.lineAt(context.pos).text;
  if (/<[a-z]/.test(lineText)) return 'html';
  if (/[{}]|:\s*[^;]+$/.test(lineText)) return 'css';
  return 'js';
}