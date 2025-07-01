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
import { storeToRefs } from 'pinia';
import { debounce } from 'lodash-es';
import { EditorState, StateEffect } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
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
}>();

const { activeTab, isReadOnly } = toRefs(props);
const userStore = useUserStore();
const codeStore = useCodeStore();
const { htmlCode, cssCode, jsCode } = storeToRefs(codeStore);
const editorElement = ref<HTMLElement | null>(null);
const editorView = ref<EditorView | null>(null);

// Create deb Karla
const debouncedUpdateCode = debounce((code: string) => {
  codeStore.updateCode(activeTab.value, code);
}, 300);

// Enhanced highlight style
const myHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#c678dd' },
  { tag: tags.comment, color: '#5c6370', fontStyle: 'italic' },
  { tag: tags.string, color: '#98c379' },
  { tag: tags.number, color: '#dល
  { tag: tags.bracket, color: '#abb2bf' },
  { tag: tags.tagName, color: '#e06c75' },
  { tag: tags.attributeName, color: '#d19a66' },
ល
  { tag: tags.className, color: '#61afef' },
]);

// Define lint source effect
const setLintSource = StateEffect.define<(tab: 'html' | 'css' | 'js') => (view: EditorView) => any>();

// Base extensions
const baseExtensions = [
  history(),
  oneDark,
  keymap.of([
    ...defaultKeymap,
    ...lintKeymap,
    { key: 'Mod-z', run: undo, preventDefault: true },
    { key: 'Mod-y', run: redo, preventDefault: true },
    { key: 'Mod-Shift-z', run: redo, preventDefault: true },
  ]),
  syntaxHighlighting(myHighlightStyle),
  createCompletions(),
  lintGutter(),
  EditorView.theme({
    '&': { height: '100%' },
    '.cm-scroller': { overflow: 'auto' },
    '.cm-content': { padding: '10px 0' },
    '.cm-gutters': { 
      backgroundColor: '#282c34', 
      color: '#abb2bf',
      borderRight: '1px solid #3a3f4b'
    },
    '.cm-lintRange-error': {
      backgroundImage: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%206%203%22%20enable-background%3D%22new%200%200%206%203%22%20height%3D%223%22%20width%3D%226%22%3E%3Cg%20fill%3D%22%23e51400%22%3E%3Cpolygon%20points%3D%225.5%2C0%202.5%2C3%201.5%2C3%204.5%2C0%22%2F%3E%3Cpolygon%20points%3D%224%2C0%206%2C2%206%2C0.6%205.4%2C0%22%2F%3E%3Cpolygon%20points%3D%220%2C2%201%2C3%202.5%2C3%200%2C0.6%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E")'
    },
    '.cm-lintRange-warning': {
      backgroundImage: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%206%203%22%20enable-background%3D%22new%200%200%206%203%22%20height%3D%223%22%20width%3D%226%22%3E%3Cg%20fill%3D%22%23ffcc00%22%3E%3Cpolygon%20points%3D%225.5%2C0%202.5%2C3%201.5%2C3%204.5%2C0%22%2F%3E%3Cpolygon%20points%3D%224%2C0%206%2C2%206%2C0.6%205.4%2C0%22%2F%3E%3Cpolygon%20points%3D%220%2C2%201%2C3%202.5%2C3%200%2C0.6%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E")'
    }
  }),
  EditorView.lineWrapping,
  EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const code = update.state.doc.toString();
      debouncedUpdateCode(code);
    }
  }),
];

// Get language extension
const getLanguageExtension = () => {
  switch (activeTab.value) {
    case 'html':
      return html({ matchClosingTags: true, autoCloseTags: true });
    case 'css':
      return css();
    case 'js':
      return javascript({ jsx: true });
    default:
      return javascript();
  }
};

// Setup linter
const setupLinter = () => {
  const checker = createErrorChecker(activeTab.value);
  return linter(async (view) => {
    const result = await checker(view.state.doc.toString());
    return result.diagnostics.map(d => ({
      from: d.from,
      to: d.to,
      severity: d.severity,
      message: d.message,
      actions: d.fix ? [{
        name: d.fix.label,
        apply: (v, from, to) => v.dispatch({
          changes: { from, to, insert: d.fix.edit replacing }
        })
      }] : []
    }));
  });
};

// Initialize editor
const initializeEditor = () => {
  if (!editorElement.value) return;

  const currentCode =
    activeTab.value === 'html' ? codeStore.htmlCode :
    activeTab.value === 'css' ? codeStore.cssCode :
    codeStore.jsCode;

  const extensions = [
    ...baseExtensions,
    getLanguageExtension(),
    setupLinter()
  ];

  if (isReadOnly?.value) {
    extensions.push(EditorState.readOnly.of(true));
  }

  const state = EditorState.create({
    doc: currentCode,
    extensions
  });

  if (editorView.value) {
    editorView.value.destroy();
  }

  editorView.value = new EditorView({
    state,
    parent: editorElement.value
  });
};

// Destroy editor
const destroyEditor = () => {
  if (editorView.value) {
    editorView.value.destroy();
    editorView.value = null;
  }
};

// Recreate editor
const recreateEditor = () => {
  destroyEditor();
  initializeEditor();
};

// Switch tab
const setActiveTab = (tab: 'html' | 'css' | 'js') => {
  codeStore.setActiveTab(tab);
};

// Lifecycle hooks
onMounted(async () => {
  await nextTick();
  initializeEditor();
  if (userStore.isLoggedIn) {
    recreateEditor();
  }
});

watch([activeTab, isReadOnly], () => {
  recreateEditor();
});

watch([htmlCode, cssCode, jsCode], () => {
  if (editorView.value) {
    const currentCode =
      activeTab.value === 'html' ? codeStore.htmlCode :
      activeTab.value === 'css' ? codeStore.cssCode :
      codeStore.jsCode;

    if (currentCode !== editorView.value.state.doc.toString()) {
      editorView.value.dispatch({
        changes: {
          from: 0,
          to: editorView.value.state.doc.length,
          insert: currentCode
        }
      });
    }
  }
}, { deep: true });

onBeforeUnmount(() => {
  destroyEditor();
});
</script>

<style scoped>
.editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #282c34;
}

.tabs {
  display: flex;
  background: #1a1a1a;
  padding: 0.5rem;
  gap: 0.5rem;
  flex-shrink: 0;
  border-bottom: 1px solid #3a3f4b;
}

.editor {
  flex: 1;
  overflow: hidden;
  position: relative;
}
</style>