// errorHighlighter.ts
import { EditorView, Decoration } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import { CodeError } from './typescript';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';

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
  widget.textContent = error.message;
  
  const severityIcon = document.createElement('span');
  severityIcon.className = `cm-severity-icon cm-severity-${error.severity}`;
  widget.prepend(severityIcon);
  
  return {
    toDOM: () => widget,
    eq: (other: any) => widget === other.toDOM(),
    updateDOM: (dom: HTMLElement) => {
      dom.className = 'cm-error-tooltip';
      dom.textContent = error.message;
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

// CSS 样式
/*
.cm-error-wave { 
  text-decoration: wavy underline red;
}
.cm-warning-wave {
  text-decoration: wavy underline orange;
}
.cm-suggestion-wave {
  text-decoration: wavy underline #6495ed;
}

.cm-error-tooltip {
  position: absolute;
  background: #ffebee;
  border-left: 3px solid #f44336;
  padding: 4px 8px;
  margin-top: 4px;
  border-radius: 2px;
  font-size: 0.8em;
  max-width: 300px;
  z-index: 100;
}

.cm-warning-tooltip {
  background: #fff3e0;
  border-left: 3px solid #ff9800;
}

.cm-suggestion-tooltip {
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
}

.cm-severity-icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
}

.cm-severity-error {
  background: #f44336;
}

.cm-severity-warning {
  background: #ff9800;
}

.cm-severity-suggestion {
  background: #2196f3;
}
*/