<template>
  <div class="app">
    <Navbar @login="showLoginDialog = true" />
    <div class="main-content">
      <div class="editor-panel" ref="editorPanel">
        <CodeEditor :activeTab="activeTab" />
      </div>
      <div class="resize-handle" @mousedown="startResize" @dblclick="resetSize"></div>
      <div class="preview-panel">
        <iframe ref="previewFrame" class="preview-frame" :class="{ 'no-pointer-events': isResizing }"></iframe>
      </div>
    </div>
    <Footer />
    <SettingsDialog v-if="showSettings" @close="showSettings = false" />
    <LoginDialog :visible="showLoginDialog" @close="showLoginDialog = false" @register="switchToRegister()" />
    <RegisterDialog :visible="showRegisterDialog" @close="showRegisterDialog = false" @login="switchToLogin()" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted,onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { debounce } from 'lodash-es';
import { useEditorStore } from '@/stores/editor';
import Navbar from '@/components/Navbar.vue';
import CodeEditor from '@/components/CodeEditor.vue';
import Footer from '@/components/Footer.vue';
import SettingsDialog from '@/components/icons/SettingsIcon.vue';
import LoginDialog from '@/components/login/LoginDialog.vue';
import RegisterDialog from '@/components/login/RegisterDialog.vue';

const editorStore = useEditorStore();
const { htmlCode, cssCode, jsCode, activeTab } = storeToRefs(editorStore);
const previewFrame = ref<HTMLIFrameElement | null>(null);
const showSettings = ref(false);
const showLoginDialog = ref(false);
const showRegisterDialog = ref(false);
const isResizing = ref(false);
// 存储鼠标按下时的 X 坐标
const startX = ref(0);
// 存储编辑器面板的初始宽度
const startWidth = ref(0);
const editorPanel = ref<HTMLElement | null>(null);

// 创建防抖的预览更新函数 (500ms)
const debouncedUpdatePreview = debounce(() => {
  if (!previewFrame.value) return;
  
  const doc = previewFrame.value.contentDocument;
  if (!doc) return;

  doc.open();
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
  `);
  doc.close();
}, 500); // 500ms防抖延迟

// 切换到注册界面
const switchToRegister = () => {
  showLoginDialog.value = false;
  showRegisterDialog.value = true;
};

// 切换到登录界面
const switchToLogin = () => {
  showRegisterDialog.value = false;
  showLoginDialog.value = true;
};


// 在鼠标按下时触发
const startResize = (e: MouseEvent) => {
  // 阻止默认事件，避免选中文本
  e.preventDefault();
  isResizing.value = true;
  startX.value = e.clientX;
  if (editorPanel.value) {
    startWidth.value = editorPanel.value.offsetWidth;
  }

  // 禁用文本选择和鼠标事件
  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'col-resize';
  document.body.style.pointerEvents = 'none';

  // 使用更高效的事件监听
  window.addEventListener('mousemove', handleResize, { passive: false });
  window.addEventListener('mouseup', stopResize, { once: true });
};

const handleResize = (e: MouseEvent) => {
  e.preventDefault();
  if (!isResizing.value || !editorPanel.value) return;

  const dx = e.clientX - startX.value;
  const containerWidth = document.querySelector('.main-content')?.clientWidth || 0;
  const minWidth = 300;
  const maxWidth = containerWidth - 300;

  // 直接计算并应用新宽度，不使用requestAnimationFrame以获得即时响应
  const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth.value + dx));
  editorPanel.value.style.width = `${newWidth}px`;
};

const stopResize = () => {
  if (!isResizing.value) return;

  isResizing.value = false;
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
  document.body.style.pointerEvents = '';

  window.removeEventListener('mousemove', handleResize);
};
// 重置编辑器面板的宽度为 50%
const resetSize = () => {
  if (editorPanel.value) {
    editorPanel.value.style.width = '50%';
  }
};

watch([htmlCode, cssCode, jsCode], debouncedUpdatePreview, { deep: true });
onMounted(() => {
  debouncedUpdatePreview();

  // 仅在调整大小时禁用 iframe 事件
  const iframe = document.querySelector('.preview-frame') as HTMLIFrameElement;
  iframe?.addEventListener('mouseover', () => {
    if (isResizing.value) {
      document.body.style.cursor = 'col-resize';
    }
  });
});
// 组件卸载时取消防抖
onBeforeUnmount(() => {
  debouncedUpdatePreview.cancel();
});
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
  background: #1a1a1a;
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
  left: 0px;
  right: 0px;
  bottom: 0;
}

.preview-panel {
  flex: 1;
  min-width: 300px;
  display: flex;
  height: 100%;
  overflow: auto; /* 改为auto以显示滚动条 */
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}
/* 仅在调整大小时禁用指针事件 */
.preview-frame.no-pointer-events {
  pointer-events: none;
}
</style>
