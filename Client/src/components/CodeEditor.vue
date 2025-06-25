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
import { ref, onMounted, watch, toRefs, onBeforeUnmount } from 'vue';
import { debounce } from 'lodash-es'; // 导入防抖函数
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { defaultKeymap, undo, redo, history } from '@codemirror/commands';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { useCodeStore } from '@/stores/codeStore';
import { useUserStore } from '@/stores/userStore';
import HtmlIcon from './icons/HtmlIcon.vue';
import CssIcon from './icons/CssIcon.vue';
import JsIcon from './icons/JsIcon.vue';
import UnifiedButton from '@/components/ui/UnifiedButton.vue';

const props = defineProps<{
  activeTab: 'html' | 'css' | 'js';
}>();

const { activeTab } = toRefs(props);
const userStore = useUserStore();
const codeStore = useCodeStore();
const editorElement = ref<HTMLElement | null>(null);
const editorView = ref<EditorView | null>(null);

// 添加对 activeTab 的 watch
watch(activeTab, (newTab, oldTab) => {
  if (newTab !== oldTab) {
    recreateEditor();
  }
});

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
      return html();
    case 'css':
      return css();
    case 'js':
      return javascript();
    default:
      return javascript();
  }
};

const initializeEditor = () => {
  if (!editorElement.value) return;

  const currentCode =
    activeTab.value === 'html' ? codeStore.htmlCode : activeTab.value === 'css' ? codeStore.cssCode : codeStore.jsCode;

  const state = EditorState.create({
    doc: currentCode,
    extensions: [...baseExtensions, getLanguageExtension()],
  });

  // 在创建新编辑器前销毁旧的
  if (editorView.value) {
    editorView.value.destroy();
  }

  editorView.value = new EditorView({
    state,
    parent: editorElement.value,
  });
};

const destroyEditor = () => {
  if (editorView.value) {
    editorView.value.destroy();
    editorView.value = null;
  }
};

const recreateEditor = () => {
  destroyEditor();
  initializeEditor();
};

const setActiveTab = (tab: 'html' | 'css' | 'js') => {
  codeStore.setActiveTab(tab);
};

onMounted(() => {
  initializeEditor();
  // 异步加载远程代码（如果用户已登录）
  if (userStore.isLoggedIn) {
    codeStore
      .loadCode(userStore.account)
      .then(() => {
        // 代码加载成功后重新初始化编辑器
        recreateEditor();
      })
      .catch(() => {
        console.log('使用本地默认代码');
      });
  }
});

watch(activeTab, () => {
  recreateEditor();
});

onBeforeUnmount(() => {
  debouncedUpdateCode.cancel();
  destroyEditor();
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
