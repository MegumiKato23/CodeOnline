<template>
  <div class="editor-container">
    <div class="tabs">
      <button 
        :class="{ active: activeTab === 'html' }" 
        @click="setActiveTab('html')"
      >
        <HtmlIcon class="icon" />
        HTML
      </button>
      <button 
        :class="{ active: activeTab === 'css' }" 
        @click="setActiveTab('css')"
      >
        <CssIcon class="icon" />
        CSS
      </button>
      <button 
        :class="{ active: activeTab === 'js' }" 
        @click="setActiveTab('js')"
      >
        <JsIcon class="icon" />
        JS
      </button>
    </div>
    <div ref="editorElement" class="editor"></div>
  </div>
</template>

watch(() => editorStore.activeTab, (newTab) => {
  if (editorView.value) {
    // 更新编辑器状态以强制刷新补全
    editorView.value.dispatch({
      effects: EditorView.reconfigure.of([
        ...baseExtensions,
        getLanguageExtension()
      ])
    });
  }
});

<script setup lang="ts">
import { ref, onMounted, watch, toRefs, onBeforeUnmount } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { defaultKeymap, undo, redo, history } from '@codemirror/commands'
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { useEditorStore } from '@/stores/editor'
import { createCompletions } from '@/utils/codeCompletions/index'
import HtmlIcon from './icons/HtmlIcon.vue'
import CssIcon from './icons/CssIcon.vue'
import JsIcon from './icons/JsIcon.vue'

const props = defineProps<{
  activeTab: 'html' | 'css' | 'js'
}>()

const { activeTab } = toRefs(props)
const editorStore = useEditorStore()
const editorElement = ref<HTMLElement | null>(null)
const editorView = ref<EditorView | null>(null)

// 增强的高亮样式
const myHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#c678dd' },
  { tag: tags.comment, color: '#5c6370', fontStyle: 'italic' },
  { tag: tags.string, color: '#98c379' },
  { tag: tags.number, color: '#d19a66' },
  { tag: tags.bracket, color: '#abb2bf' },
  { tag: tags.tagName, color: '#e06c75' },
  { tag: tags.attributeName, color: '#d19a66' },
  { tag: tags.className, color: '#61afef' },
])

// 基础扩展配置
const baseExtensions = [
  history(),
  oneDark,
  keymap.of([
    ...defaultKeymap,
    { key: "Mod-z", run: undo, preventDefault: true },
    { key: "Mod-y", run: redo, preventDefault: true },
    { key: "Mod-Shift-z", run: redo, preventDefault: true }
  ]),
  syntaxHighlighting(myHighlightStyle),
  createCompletions(), // 使用自动语言检测的补全
  EditorView.theme({
    "&": { height: "100%" },
    ".cm-scroller": { overflow: "auto" },
    ".cm-content": { padding: "10px 0" },
    ".cm-gutters": { 
      backgroundColor: "#282c34", 
      color: "#abb2bf",
      borderRight: "1px solid #3a3f4b"
    },
  }),
  EditorView.lineWrapping,
  EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const code = update.state.doc.toString()
      editorStore.updateCode(activeTab.value, code)
    }
  })
]

// 获取当前语言扩展
const getLanguageExtension = () => {
  switch (activeTab.value) {
     case 'html': 
      return html({ 
        matchClosingTags: true,
        autoCloseTags: true,
        })
    case 'css': return css()
    case 'js': return javascript()
    default: return javascript()
  }
}

// 初始化编辑器
const initializeEditor = () => {
  if (!editorElement.value) return

  const currentCode = 
    activeTab.value === 'html' ? editorStore.htmlCode :
    activeTab.value === 'css' ? editorStore.cssCode :
    editorStore.jsCode

  const state = EditorState.create({
    doc: currentCode,
    extensions: [
      ...baseExtensions,
      getLanguageExtension()
    ]
  })

  editorView.value = new EditorView({
    state,
    parent: editorElement.value
  })
}

// 销毁编辑器实例
const destroyEditor = () => {
  editorView.value?.destroy()
  editorView.value = null
}

// 重新创建编辑器
const recreateEditor = () => {
  destroyEditor()
  initializeEditor()
}

// 切换标签页
const setActiveTab = (tab: 'html' | 'css' | 'js') => {
  editorStore.setActiveTab(tab)
}

// 生命周期钩子
onMounted(initializeEditor)
watch(activeTab, recreateEditor)
onBeforeUnmount(destroyEditor)
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

.tabs button {
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
  transition: all 0.2s ease;
}

.tabs button.active {
  background: #333;
  color: white;
  box-shadow: 0 0 0 1px #61afef;
}

.tabs button:hover {
  background: #333;
}

.editor {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}
</style>
