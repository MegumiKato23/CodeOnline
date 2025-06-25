import { autocompletion, Completion, CompletionContext } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import { htmlCompletions } from './html';
import { cssCompletions } from './css';
import { jsCompletions } from './javascript';

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
  const prefix = context.state.doc.sliceString(
    Math.max(0, context.pos - 10),
    context.pos
  ).replace(/.*\W/, '');

  return options.sort((a, b) => {
    const aMatch = a.label.toLowerCase().startsWith(prefix.toLowerCase()) ? 0 : 1;
    const bMatch = b.label.toLowerCase().startsWith(prefix.toLowerCase()) ? 0 : 1;
    return aMatch - bMatch || (b.boost || 0) - (a.boost || 0);
  });
}

export const createCompletions = () => {
  const cached: CachedData = {
    html: { tags: [], attributes: [] },
    css: { properties: [], values: [] },
  };

  return autocompletion({
    override: [
      (context: CompletionContext) => {
        const lang = getActiveLang(context);
        const completions = lang === 'html' ? htmlCompletions(context)
          : lang === 'css' ? cssCompletions(context)
          : jsCompletions(context);

        return completions ? {
          ...completions,
          options: sortCompletions(context, completions.options),
        } : null;
      },
    ],
  });
};

function getActiveLang(context: CompletionContext): 'html' | 'css' | 'js' {
  const tree = syntaxTree(context.state);
  const node = tree.resolveInner(context.pos, -1);

  if (node.name.includes('JsxElement') || node.name.includes('HtmlTag')) {
    return 'html';
  }
  if (node.name.includes('Rule') || node.name.includes('Declaration')) {
    return 'css';
  }

  const line = context.state.doc.lineAt(context.pos);
  const textBefore = line.text.slice(0, context.pos - line.from);

  if (/<[a-z][^>]*$/i.test(textBefore)) return 'html';
  if (/(^|\}|\{)[^\{]*$/.test(textBefore) && /:\s*[^;]*$/.test(textBefore)) {
    return 'css';
  }

  return 'js';
}