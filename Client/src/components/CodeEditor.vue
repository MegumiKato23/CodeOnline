<template>
  <div class="editor-container">
    <div class="tabs">
      <UnifiedButton type="tab" :active="activeTab === 'html'" :icon="HtmlIcon" @click="setActiveTab('html')">
        HTML
      </UnifiedButton>
      <UnifiedButton type="tab" :active="activeTab === 'css'" :icon="CssIcon" @click="setActiveTab('css')">
        CSS
      </UnifiedButton>
      <UnifiedButton type="tab" :active="activeTab === 'js'" :icon="JsIcon" @click="setActiveTab('js')">
        JS
      </UnifiedButton>
    </div>
    <div ref="editorElement" class="editor"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, toRefs, onBeforeUnmount, nextTick } from 'vue';
import { debounce } from 'lodash-es'; // 导入防抖函数
import { EditorState, StateEffect, EditorSelection } from '@codemirror/state';
import { EditorView, keymap, Decoration, DecorationSet } from '@codemirror/view';
import { StateField } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { sass } from '@codemirror/lang-sass';
import { less } from '@codemirror/lang-less';
import { vue } from '@codemirror/lang-vue';
import { defaultKeymap, undo, redo, history } from '@codemirror/commands';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { linter, lintGutter, lintKeymap } from '@codemirror/lint';
import { useCodeStore } from '@/stores/codeStore';
import { useUserStore } from '@/stores/userStore';
import { createCompletions } from '@/utils/codeCompletions/index';
import { createErrorChecker } from '@/utils/errorChecker1';
import HtmlIcon from './icons/HtmlIcon.vue';
import CssIcon from './icons/CssIcon.vue';
import JsIcon from './icons/JsIcon.vue';
import UnifiedButton from '@/components/ui/UnifiedButton.vue';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  activeTab: 'html' | 'css' | 'js';
  isReadOnly?: boolean;
  cssSyntax?: 'css' | 'sass' | 'less';
  framework: '' | 'vue' | 'react';
}>();

const { activeTab, isReadOnly, cssSyntax, framework } = toRefs(props);
const userStore = useUserStore();
const codeStore = useCodeStore();
const { htmlCode, cssCode, jsCode } = storeToRefs(codeStore);
const editorElement = ref<HTMLElement | null>(null);
const editorViews = ref({
  html: null as EditorView | null,
  css: null as EditorView | null,
  js: null as EditorView | null,
});

const currentView = ref<EditorView | null>(null);
const errorLineDecorations = ref<any>(null);

// 创建防抖的代码更新函数 (300ms)
const debouncedUpdateCode = debounce((code: string) => {
  codeStore.updateCode(activeTab.value, code);
}, 300); // 300ms防抖延迟
// 自定义高亮样式
const myHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#c678dd' },
  { tag: tags.comment, color: '#5c6370', fontStyle: 'italic' },
  { tag: tags.string, color: '#98c379' },
  { tag: tags.number, color: '#d19a66' },
  { tag: tags.bracket, color: '#abb2bf' },
  { tag: tags.tagName, color: '#e06c75' },
  { tag: tags.attributeName, color: '#d19a66' },
  { tag: tags.className, color: '#61afef' },
]);
const handleTab = (view: EditorView) => {
  const selection = view.state.selection;
  const changes = [];
  const newRanges = [];

  // 处理多选区
  for (const range of selection.ranges) {
    if (range.empty) {
      // 单光标插入4个空格
      changes.push({
        from: range.from,
        insert: '    ', // 4个空格
      });
      newRanges.push(EditorSelection.range(range.from + 4, range.from + 4));
    } else {
      // 多行缩进
      const lines = [];
      for (let pos = range.from; pos <= range.to; ) {
        const line = view.state.doc.lineAt(pos);
        lines.push(line);
        pos = line.to + 1;
      }

      // 为每行添加缩进
      let totalAdded = 0;
      for (const line of lines) {
        changes.push({
          from: line.from,
          insert: '    ', // 4个空格
        });
        totalAdded += 4;
      }

      newRanges.push(EditorSelection.range(range.from + 4, range.to + lines.length * 4));
    }
  }

  view.dispatch({
    changes,
    selection: EditorSelection.create(newRanges),
    scrollIntoView: true,
  });
  return true;
};

const handleShiftTab = (view: EditorView) => {
  const selection = view.state.selection;
  const changes = [];
  const newRanges: { anchor: number; head: number }[] = [];

  // 处理每个选区
  for (const range of selection.ranges) {
    const lines = [];
    let pos = range.from;

    // 收集所有受影响的行
    while (pos <= range.to) {
      const line = view.state.doc.lineAt(pos);
      lines.push(line);
      pos = line.to + 1;
    }

    let anchorShift = 0;
    let headShift = 0;

    // 处理每行的缩进
    for (const line of lines) {
      const lineText = view.state.sliceDoc(line.from, line.to);
      const leadingSpaces = lineText.match(/^[ ]{1,4}/)?.[0] || '';

      if (leadingSpaces.length > 0) {
        const removeCount = Math.min(leadingSpaces.length, 4);
        changes.push({
          from: line.from,
          to: line.from + removeCount,
          insert: '',
        });

        // 计算光标偏移
        if (range.anchor >= line.from && range.anchor <= line.to) {
          anchorShift = removeCount;
        }
        if (range.head >= line.from && range.head <= line.to) {
          headShift = removeCount;
        }
      }
    }

    // 计算新的选区范围
    const newAnchor = Math.max(0, range.anchor - anchorShift);
    const newHead = Math.max(0, range.head - headShift);

    newRanges.push({
      anchor: newAnchor,
      head: newHead,
    });
  }

  if (changes.length > 0) {
    view.dispatch({
      changes,
      selection: EditorSelection.create(newRanges.map((r) => EditorSelection.range(r.anchor, r.head))),
      scrollIntoView: true,
    });
    return true;
  }
  return false;
};
// 定义错误检查效果
const setLintSource = StateEffect.define<(tab: 'html' | 'css' | 'js') => (view: EditorView) => any>();

// 定义错误行高亮效果
const addErrorHighlight = StateEffect.define<{ line: number }>();
const clearErrorHighlight = StateEffect.define();

// 错误行装饰器
const errorLineDecoration = Decoration.line({
  attributes: { class: 'cm-error-line' },
});

// 错误行高亮状态字段
const errorHighlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);

    for (let effect of tr.effects) {
      if (effect.is(addErrorHighlight)) {
        const line = tr.state.doc.line(effect.value.line);
        decorations = decorations.update({
          add: [errorLineDecoration.range(line.from)],
        });
      } else if (effect.is(clearErrorHighlight)) {
        decorations = Decoration.none;
      }
    }

    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

// 基础扩展
const baseExtensions = [
  history(), // 历史记录必须放在前面
  oneDark,
  keymap.of([
    ...defaultKeymap,
    { key: 'Mod-z', run: undo, preventDefault: true },
    { key: 'Mod-y', run: redo, preventDefault: true },
    { key: 'Mod-Shift-z', run: redo, preventDefault: true },
    { key: 'Tab', run: handleTab },
    { key: 'Shift-Tab', run: handleShiftTab },
  ]),
  syntaxHighlighting(myHighlightStyle),
  createCompletions(),
  //报错提示
  lintGutter(),
  errorHighlightField, // 添加错误行高亮字段
  EditorView.theme({
    '&': {
      height: '100%',
      maxHeight: '100%', // 添加最大高度限制
    },
    '.cm-scroller': {
      overflow: 'auto',
      maxHeight: '100%', // 确保滚动容器不超过父容器
    },
    '.cm-content': {
      padding: '10px 0',
      minHeight: '100%', // 确保内容区域至少填满容器
    },
    '.cm-gutters': { backgroundColor: '#282c34', color: '#abb2bf' },
    '.cm-error-line': {
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      borderLeft: '3px solid #ff6b6b',
    },
  }),
  EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const code = update.state.doc.toString();
      debouncedUpdateCode(code); // 使用防抖函数
    }
  }),
];

// 跳转到指定行并高亮
const gotoLine = (lineNumber: number, errorType?: string) => {
  return new Promise<void>((resolve) => {
    // 如果错误类型存在且与当前激活标签不同，则切换标签
    if (errorType && errorType !== activeTab.value) {
      setActiveTab(errorType as 'html' | 'css' | 'js');
      // 等待下一个tick再跳转
      nextTick(() => gotoLine(lineNumber, errorType).then(resolve));
      return;
    }

    if (typeof lineNumber !== 'number' || isNaN(lineNumber)) {
      console.error(`[CodeEditor] 无效行号: ${lineNumber}`);
      return;
    }

    const view = currentView.value;
    if (!view) return;

    const lineCount = view.state.doc.lines;
    if (lineNumber < 1 || lineNumber > lineCount) {
      console.error(`[CodeEditor] 行号超出范围: ${lineNumber} (总行数: ${lineCount})`);
      return;
    }

    try {
      // 清除之前的高亮
      view.dispatch({
        effects: clearErrorHighlight.of(null),
      });

      // 确保行号在有效范围内
      const maxLine = view.state.doc.lines;
      const targetLine = Math.min(lineNumber, maxLine);

      // 获取目标行的位置
      const line = view.state.doc.line(targetLine);

      // 跳转到指定行
      view.dispatch({
        selection: EditorSelection.single(line.from),
        effects: addErrorHighlight.of({ line: targetLine }),
        scrollIntoView: true,
      });

      // 聚焦编辑器
      view.focus();

      // 3秒后清除高亮
      setTimeout(() => {
        if (view) {
          view.dispatch({
            effects: clearErrorHighlight.of(null),
          });
        }
        resolve();
      }, 3000);
    } catch (error) {
      console.error('跳转到行失败:', error);
      resolve();
    }
  });
};

// 暴露方法给父组件
defineExpose({
  gotoLine,
});

const getLanguageExtension = () => {
  switch (activeTab.value) {
    case 'html':
      if (framework.value === 'vue') {
        return vue();
      } else if (framework.value === 'react') {
        return javascript({ jsx: true });
      }
      return html();
    case 'css':
      switch (cssSyntax?.value) {
        case 'sass':
          return sass();
        case 'less':
          return less();
        default:
          return css();
      }
    case 'js':
      if (framework.value === 'vue') {
        return vue();
      } else if (framework.value === 'react') {
        return javascript({ jsx: true });
      }
      return javascript();
    default:
      return javascript();
  }
};
// 设置错误检查扩展
const setupLinter = () => {
  // 确保错误检测器只被调用一次
  const checker = createErrorChecker(activeTab.value);
  return linter(async (view) => {
    const result = await checker(view.state.doc.toString());
    return result.diagnostics.map((d) => ({
      from: d.from,
      to: d.to,
      severity: d.severity,
      message: d.message,
      actions: d.fix
        ? [
            {
              name: d.fix.label,
              apply: (v, from, to) =>
                v.dispatch({
                  changes: { from, to, insert: d.fix.edit[0].insert },
                }),
            },
          ]
        : [],
    }));
  });
};

const initializeEditor = () => {
  if (!editorElement.value) return;
  editorElement.value.innerHTML = '';

  // 检查当前编辑器是否存在以及只读状态是否匹配
  const existingView = editorViews.value[activeTab.value];
  if (existingView) {
    // 检查当前编辑器的只读状态是否与期望一致
    const currentReadOnly = existingView.state.readOnly;
    const expectedReadOnly = isReadOnly?.value || false;

    if (currentReadOnly === expectedReadOnly) {
      // 状态一致，直接复用
      editorElement.value.appendChild(existingView.dom);
      return;
    } else {
      // 状态不一致，销毁旧编辑器，重新创建
      existingView.destroy();
      editorViews.value[activeTab.value] = null;
    }
  }
  const currentCode =
    activeTab.value === 'html' ? codeStore.htmlCode : activeTab.value === 'css' ? codeStore.cssCode : codeStore.jsCode;

  // 根据只读状态配置扩展
  const extensions = [...baseExtensions, getLanguageExtension(), setupLinter()]; // 这里加入了 setupLinter()
  if (isReadOnly?.value) {
    extensions.push(EditorState.readOnly.of(true));
  }

  const state = EditorState.create({
    doc: currentCode,
    extensions,
  });
  // 创建新编辑器
  const view = new EditorView({
    state,
    parent: editorElement.value,
  });
  // 保存编辑器视图
  editorViews.value[activeTab.value] = view;
  currentView.value = view;
};

const destroyAllEditors = () => {
  Object.values(editorViews.value).forEach((view) => {
    if (view) {
      view.destroy();
    }
  });
  editorViews.value = { html: null, css: null, js: null };
  currentView.value = null;
};

const setActiveTab = (tab: 'html' | 'css' | 'js') => {
  codeStore.setActiveTab(tab);
};

onMounted(async () => {
  await nextTick();
  initializeEditor();
});

watch([activeTab, isReadOnly], () => {
  initializeEditor();
});

// 分别监听各种代码类型的变化
watch(
  [htmlCode, cssCode, jsCode],
  () => {
    const view = editorViews.value[activeTab.value];
    // 当代码内容变化且当前标签页对应的代码发生变化时，更新编辑器
    if (!view) return;

    const currentCode =
      activeTab.value === 'html'
        ? codeStore.htmlCode
        : activeTab.value === 'css'
          ? codeStore.cssCode
          : codeStore.jsCode;

    if (currentCode !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: currentCode,
        },
      });
    }
  },
  { deep: true }
);

onBeforeUnmount(() => {
  destroyAllEditors();
});
</script>

<style scoped>
.editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs {
  display: flex;
  background: #1a1a1a;
  padding: 0.5rem;
  gap: 0.5rem;
  flex-shrink: 0;
}

.editor {
  flex: 1;
  overflow: hidden;
  position: relative;
  max-height: 100%; /* 添加最大高度限制 */
}

/* 确保CodeMirror编辑器不会超出容器 */
.editor :deep(.cm-editor) {
  height: 100%;
  max-height: 100%;
}

.editor :deep(.cm-scroller) {
  max-height: 100%;
  overflow-y: auto;
}
</style>
