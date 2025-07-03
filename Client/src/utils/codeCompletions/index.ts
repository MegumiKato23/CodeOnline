import { autocompletion, Completion } from '@codemirror/autocomplete';
import { Extension } from '@codemirror/state';
import { htmlCompletions } from './html';
import { cssCompletions } from './css';
import { jsCompletions } from './javascript';
import { syntaxTree, language } from '@codemirror/language'; // 注意这里改为 language
import { CompletionContext } from '@codemirror/autocomplete';

interface CompletionItem {
  label: string;
  type?: 'tag' | 'attribute' | 'property' | 'value';
  boost?: number;
  info?: string;
}

interface CachedData {
  html: {
    tags: CompletionItem[];
    attributes: CompletionItem[];
  };
  css: {
    properties: CompletionItem[];
    values: CompletionItem[];
  };
}

function sortCompletions(context: CompletionContext, options: Completion[]) {
  const prefix = context.state.doc.sliceString(Math.max(0, context.pos - 10), context.pos).replace(/.*\W/, '');

  return options.sort((a, b) => {
    const aMatch = a.label.toLowerCase().startsWith(prefix.toLowerCase()) ? 0 : 1;
    const bMatch = b.label.toLowerCase().startsWith(prefix.toLowerCase()) ? 0 : 1;
    return aMatch - bMatch || (b.boost || 0) - (a.boost || 0);
  });
}

const cached: CachedData = {
  html: { tags: [], attributes: [] },
  css: { properties: [], values: [] },
};

export const createCompletions = (projectContext?: any): Extension => {
  const completionSource = (context: CompletionContext) => {
    const lang = getActiveLang(context);
    let completions = null;

    if (lang === 'html') {
      completions = htmlCompletions(context, projectContext);
    } else if (lang === 'css') {
      completions = cssCompletions(context, projectContext); // 确保传入 projectContext
    } else {
      completions = jsCompletions(context, projectContext);
    }

    if (!completions) return null;

    return {
      ...completions,
      options: sortCompletions(context, completions.options),
    };
  };

  return autocompletion({ override: [completionSource] });
};

// 递归向上查找语法树节点，判断语言类型
function getActiveLang(context: CompletionContext): 'html' | 'css' | 'js' {
  const tree = syntaxTree(context.state);
  let node = tree.resolveInner(context.pos, -1);

  // 优先根据编辑器语言模式判断
  const lang = context.state.facet(language); // 这里改为 language
  if (lang) {
    const langName = (lang as any).name?.toLowerCase(); // 类型断言，防止 unknown 报错
    if (langName) {
      if (
        langName.includes('javascript') ||
        langName.includes('typescript') ||
        langName.includes('jsx') ||
        langName.includes('tsx')
      ) {
        return 'js';
      }
      if (langName.includes('css') || langName.includes('scss') || langName.includes('less')) {
        return 'css';
      }
      if (langName.includes('html') || langName.includes('xml')) {
        return 'html';
      }
    }
  }

  // 结合语法树节点类型判断
  while (node) {
    const type = node.type;

    if (
      type.name === 'Script' ||
      type.name === 'ScriptElement' ||
      type.name === 'JavaScript' ||
      type.name === 'TS' ||
      type.name === 'JSXElement'
    ) {
      return 'js';
    }
    if (
      type.name === 'Style' ||
      type.name === 'CSS' ||
      type.name === 'RuleSet' ||
      type.name === 'Declaration' ||
      type.name === 'PropertyName' ||
      type.name === 'PropertyValue'
    ) {
      return 'css';
    }
    if (
      type.name === 'HTML' ||
      type.name === 'HTMLElement' ||
      type.name === 'Tag' ||
      type.name === 'Attribute' ||
      type.name === 'Text'
    ) {
      return 'html';
    }

    if (type.name === 'Element') {
      const firstChild = node.firstChild;
      if (firstChild && firstChild.type.name.toLowerCase() === 'script') return 'js';
      if (firstChild && firstChild.type.name.toLowerCase() === 'style') return 'css';
    }

    node = node.parent;
  }

  return 'html';
}
