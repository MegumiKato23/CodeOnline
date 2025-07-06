// errorHighlighter.ts
import { EditorView, Decoration, ViewUpdate } from '@codemirror/view';
import { RangeSetBuilder, StateField } from '@codemirror/state';
import { CodeError } from './typescript';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { showPanel } from '@codemirror/view';
import { EditorState } from '@codemirror/state';

export const errorHighlighter = (errors: CodeError[]) => {
  // 定义错误高亮样式
  const errorHighlightStyle = HighlightStyle.define([
    { tag: tags.invalid, color: '#ff0000', fontWeight: 'bold' },
    { tag: tags.content, color: '#ff9999', fontStyle: 'italic' }
  ]);

  return [
    // 1. 波浪线装饰
    EditorView.decorations.of(view => {
      const builder = new RangeSetBuilder<Decoration>();
      errors.forEach(error => {
        const className = error.severity === 'error' 
          ? 'cm-error-wave' 
          : error.severity === 'warning' 
            ? 'cm-warning-wave' 
            : 'cm-suggestion-wave';
        
        builder.add(
          error.from,
          error.to,
          Decoration.mark({ 
            class: className,
            attributes: { 
              'data-error-message': error.message,
              'data-error-severity': error.severity
            }
          })
        );
      });
      return builder.finish();
    }),
    
    // 2. 背景高亮
    EditorView.baseTheme({
      '.cm-error-highlight': { backgroundColor: 'rgba(255, 0, 0, 0.1)' },
      '.cm-warning-highlight': { backgroundColor: 'rgba(255, 165, 0, 0.1)' },
      '.cm-suggestion-highlight': { backgroundColor: 'rgba(100, 149, 237, 0.1)' }
    }),
    
    // 3. 错误提示气泡
    EditorView.decorations.of(view => {
      const builder = new RangeSetBuilder<Decoration>();
      errors.forEach(error => {
        if (error.severity === 'error') {
          builder.add(
            error.from,
            error.from,
            Decoration.widget({
              widget: createErrorWidget(error),
              side: 1
            })
          );
        }
      });
      return builder.finish();
    }),
    
    // 应用高亮样式
    syntaxHighlighting(errorHighlightStyle)
  ];
};

function createErrorWidget(error: CodeError) {
  const widget = document.createElement('div');
  widget.className = 'cm-error-tooltip';
  
  // 错误信息容器
  const messageContainer = document.createElement('div');
  messageContainer.textContent = error.message;
  
  // 严重性图标
  const severityIcon = document.createElement('span');
  severityIcon.className = `cm-severity-icon cm-severity-${error.severity}`;
  
  // 快速修复按钮
  const fixButton = document.createElement('button');
  fixButton.className = 'cm-fix-button';
  fixButton.textContent = '快速修复';
  fixButton.onclick = () => {
    if (error.fix && typeof error.fix === 'function') {
      (error.fix as Function)();
    }
  };
  
  // 错误分类标记
  const categoryTag = document.createElement('span');
  categoryTag.className = 'cm-error-category';
  categoryTag.textContent = error.category || '其他';
  
  widget.append(severityIcon, messageContainer, fixButton, categoryTag);
  
  return {
    toDOM: () => widget,
    eq: (other: any) => widget === other.toDOM(),
    updateDOM: (dom: HTMLElement) => {
      dom.className = 'cm-error-tooltip';
      return true;
    },
    estimatedHeight: -1,
    ignoreEvent: () => true,
    destroy: () => {},
    get estimatedWidth() {
      return widget.offsetWidth;
    },
    lineBreaks: 0,
    coordsAt: () => null
  };
}

// 错误面板扩展
function errorPanel(view: EditorView) {
  const dom = document.createElement('div');
  dom.className = 'cm-error-panel';
  
  const errors = view.state.field(errorField) as CodeError[];
  errors.forEach(error => {
    const errorItem = document.createElement('div');
    errorItem.className = `cm-error-item cm-severity-${error.severity}`;
    errorItem.textContent = `${error.message} (行 ${error.line})`;
    errorItem.onclick = () => {
      view.dispatch({
        selection: { anchor: error.from },
        effects: EditorView.scrollIntoView(error.from, { y: 'center' })
      });
    };
    dom.appendChild(errorItem);
  });
  
  return {
    dom,
    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet) {
        const newErrors = update.state.field(errorField) as CodeError[];
        dom.textContent = '';
        newErrors.forEach(error => {
          const errorItem = document.createElement('div');
          errorItem.className = `cm-error-item cm-severity-${error.severity}`;
          errorItem.textContent = `${error.message} (行 ${error.line})`;
          errorItem.onclick = () => {
            update.view.dispatch({
              selection: { anchor: error.from },
              effects: EditorView.scrollIntoView(error.from, { y: 'center' })
            });
          };
          dom.appendChild(errorItem);
        });
      }
    },
    destroy() {}
  };
}

// 错误状态字段
const errorField = StateField.define<CodeError[]>({
  create: () => [],
  update: (value, tr) => {
    if (tr.docChanged || tr.selection) {
      return tr.state.field(errorField);
    }
    return value;
  }
});