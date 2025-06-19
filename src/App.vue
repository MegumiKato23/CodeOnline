<template>
  <div class="app">
    <Navbar />
    <div class="main-content">
      <div class="editor-panel" ref="editorPanel">
        <CodeEditor :activeTab="activeTab" />
      </div>
      <div 
        class="resize-handle" 
        @mousedown="startResize"
        @dblclick="resetSize"
      ></div>
      <div class="preview-panel">
        <iframe ref="previewFrame" class="preview-frame"></iframe>
      </div>
    </div>
    <Footer />
    <SettingsDialog v-if="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor'
import Navbar from '@/components/Navbar.vue'
import CodeEditor from '@/components/CodeEditor.vue'
import Footer from '@/components/Footer.vue'
import SettingsDialog from '@/components/icons/SettingsIcon.vue'

const editorStore = useEditorStore()
const { htmlCode, cssCode, jsCode, activeTab } = storeToRefs(editorStore)
const previewFrame = ref<HTMLIFrameElement | null>(null)
const showSettings = ref(false)
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)
const editorPanel = ref<HTMLElement | null>(null)

const updatePreview = () => {
  if (!previewFrame.value) return
  
  const doc = previewFrame.value.contentDocument
  if (!doc) return
  
  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>${cssCode.value}</style>
      </head>
      <body>
        ${htmlCode.value}
        <script>${jsCode.value}<\/script>
      </body>
    </html>
  `)
  doc.close()
}

const startResize = (e: MouseEvent) => {
  e.preventDefault()
  isResizing.value = true
  startX.value = e.clientX
  if (editorPanel.value) {
    startWidth.value = editorPanel.value.offsetWidth
  }
  
  // 禁用文本选择和鼠标事件
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
  document.body.style.pointerEvents = 'none'
  
  // 使用更高效的事件监听
  window.addEventListener('mousemove', handleResize, { passive: false })
  window.addEventListener('mouseup', stopResize, { once: true })
}

const handleResize = (e: MouseEvent) => {
  e.preventDefault()
  if (!isResizing.value || !editorPanel.value) return
  
  const dx = e.clientX - startX.value
  const containerWidth = document.querySelector('.main-content')?.clientWidth || 0
  const minWidth = 300
  const maxWidth = containerWidth - 300
  
  // 直接计算并应用新宽度，不使用requestAnimationFrame以获得即时响应
  const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth.value + dx))
  editorPanel.value.style.width = `${newWidth}px`
}

const stopResize = () => {
  if (!isResizing.value) return
  
  isResizing.value = false
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
  document.body.style.pointerEvents = ''
  
  window.removeEventListener('mousemove', handleResize)
}

const resetSize = () => {
  if (editorPanel.value) {
    editorPanel.value.style.width = '50%'
  }
}

watch([htmlCode, cssCode, jsCode], updatePreview, { deep: true })
onMounted(() => {
  updatePreview()
  
  // 防止iframe捕获鼠标事件
  const iframe = document.querySelector('.preview-frame') as HTMLIFrameElement
  iframe?.addEventListener('mouseover', () => {
    if (isResizing.value) {
      document.body.style.cursor = 'col-resize'
    }
  })
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a1a;
  color: white;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: calc(100vh - 60px); /* 假设导航栏和页脚总高度为60px */
  position: relative;
}

.editor-panel {
  width: 50%;
  min-width: 300px;
  max-width: calc(100% - 300px);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #1e1e1e;

}

.resize-handle {
  width: 8px;
  background: #333;
  cursor: col-resize;
  position: relative;
  z-index: 10;
  transition: background 0.1s;
  -webkit-user-select: none;
  user-select: none;
}

.resize-handle:hover {
  background: #555;
}

.resize-handle::before {
  content: '';
  position: absolute;
  top: 0;
  left: -10px;
  right: -10px;
  bottom: 0;
}

.preview-panel {
  flex: 1;
  min-width: 300px;
  display: flex;
  height: 100%;
  overflow: hidden;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
  pointer-events: none;
}

/* 防止iframe干扰鼠标事件 */
.preview-frame {
  pointer-events: none;
}

.resizing .preview-frame {
  pointer-events: none;
}
</style>