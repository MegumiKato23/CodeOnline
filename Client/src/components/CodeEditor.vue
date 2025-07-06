<template>
  <div class="editor-container">
    <div class="tabs">
      <UnifiedButton type="tab" :active="activeTab === 'html'" :icon="HtmlIcon" @click="setActiveTab('html')">
        <!-- <HtmlIcon class="icon" /> -->
        HTML
      </UnifiedButton>
      <UnifiedButton type="tab" :active="activeTab === 'css'" :icon="CssIcon" @click="setActiveTab('css')">
        <!-- <CssIcon class="icon" /> -->
        CSS
      </UnifiedButton>
      <UnifiedButton type="tab" :active="activeTab === 'js'" :icon="JsIcon" @click="setActiveTab('js')">
        <!-- <JsIcon class="icon" /> -->
        JS
      </UnifiedButton>
    </div>
    <div ref="editorElement" class="editor"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, toRefs, onBeforeUnmount, nextTick } from 'vue';
import { debounce } from 'lodash-es'; // 导入防抖函数
import { EditorState, StateEffect } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
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

const props = defineProps<{
  activeTab: 'html' | 'css' | 'js';
  isReadOnly?: boolean;
  cssSyntax?: 'css' | 'sass' | 'less';
  framework: ''|'vue' | 'react'; 
}>();

const { activeTab, isReadOnly, cssSyntax, framework } = toRefs(props);
const userStore = useUserStore();
const codeStore = useCodeStore();
const editorElement = ref<HTMLElement | null>(null);
const editorViews = ref({
  html: null as EditorView | null,
  css: null as EditorView | null,
  js: null as EditorView | null,
});

const currentView = ref<EditorView | null>(null);

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
// 定义错误检查效果
const setLintSource = StateEffect.define<(tab: 'html' | 'css' | 'js') => (view: EditorView) => any>();
// 基础扩展
const baseExtensions = [
  history(), // 历史记录必须放在前面
  oneDark,
  keymap.of([
    ...defaultKeymap,
    { key: 'Mod-z', run: undo, preventDefault: true },
    { key: 'Mod-y', run: redo, preventDefault: true },
    { key: 'Mod-Shift-z', run: redo, preventDefault: true },
  ]),
  syntaxHighlighting(myHighlightStyle),
  createCompletions(),
  //报错提示
  lintGutter(),
  EditorView.theme({
    '&': { height: '100%' },
    '.cm-scroller': { overflow: 'auto' },
    '.cm-content': { padding: '10px 0' },
    '.cm-gutters': { backgroundColor: '#282c34', color: '#abb2bf' },
  }),
  EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const code = update.state.doc.toString();
      debouncedUpdateCode(code); // 使用防抖函数
    }
  }),
];
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
  // 如果当前标签页的编辑器已存在，只需显示它
  if (editorViews.value[activeTab.value]) {
    editorElement.value.innerHTML = '';
    editorElement.value.appendChild(editorViews.value[activeTab.value]!.dom);
    return;
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
  initializeEditor();
  if (userStore.isLoggedIn) {
    await nextTick();
    initializeEditor();
  }
});

watch(activeTab, () => {
  initializeEditor();
});

// 分别监听各种代码类型的变化
watch(
  [() => codeStore.htmlCode, () => codeStore.cssCode, () => codeStore.jsCode],
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

/* .tabs button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #2a2a2a;
  color: #ccc;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
} */

/* .tabs button.active {
  background: #333;
  color: white;
} */

/* .tabs button:hover {
  background: #333;
} */

.editor {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* .icon {
  width: 16px;
  height: 16px;
} */
</style>
