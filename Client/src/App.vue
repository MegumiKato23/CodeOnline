<template>
  <div class="app">
    <Navbar @login="showLoginDialog = true" />
    <div v-if="status==='true'" class="main-content">
      <div class="editor-panel" ref="editorPanel">
        <CodeEditor :activeTab="activeTab" :isReadOnly="userStore.isReadOnlyMode" />
      </div>
      <div class="resize-handle" @mousedown="startResize" @dblclick="resetSize"></div>
      <div class="preview-panel">
        <iframe
          sandbox="allow-scripts  allow-same-origin"
          ref="previewFrame"
          class="preview-frame"
          :class="{ 'no-pointer-events': isResizing }"
        ></iframe>
      </div>
    </div>
<<<<<<< HEAD
    <div v-else class="main-content">
      <div class="preview-panel">
        <iframe ref="previewFrame" class="preview-frame" :class="{ 'no-pointer-events': isResizing }"></iframe>
      </div>
      <div class="resize-handle" @mousedown="startResize" @dblclick="resetSize"></div>
      <div class="editor-panel" ref="editorPanel">
        <CodeEditor :activeTab="activeTab" />
      </div>
    </div>
    <Footer />
=======
<<<<<<< feature-share
    <Footer :isReadOnly="userStore.isReadOnlyMode" @login="showLoginDialog = true" />
=======
    <Footer :isReadOnly="userStore.isReadOnlyMode" />
>>>>>>> main
>>>>>>> c6380117eab95518a8e0c6840a44b89f919d8f52
    <SettingsDialog v-if="showSettings" @close="showSettings = false" />
    <LoginDialog :visible="showLoginDialog" @close="showLoginDialog = false" @register="switchToRegister()" />
    <RegisterDialog :visible="showRegisterDialog" @close="showRegisterDialog = false" @login="switchToLogin()" />
    <!-- <head_portrait @login="showLoginDialog = true" /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { debounce } from 'lodash-es'; // 导入防抖函数
import { useCodeStore } from '@/stores/codeStore';
import { useUserStore } from '@/stores/userStore';
import type { ProjectPermissions } from '@/stores/userStore';
import Navbar from '@/components/Navbar.vue';
import CodeEditor from '@/components/CodeEditor.vue';
import Footer from '@/components/Footer.vue';
import SettingsDialog from '@/components/icons/SettingsIcon.vue';
import LoginDialog from '@/components/login/LoginDialog.vue';
import RegisterDialog from '@/components/login/RegisterDialog.vue';
import head_portrait from './components/head_portrait.vue';
import { api } from '@/api/index';
import { Users } from 'lucide-vue-next';
<<<<<<< feature-share
import { ShareService } from '@/services/shareService';
=======
>>>>>>> main

const codeStore = useCodeStore();
const userStore = useUserStore();

//用户访问权限
const permissions = ref<ProjectPermissions | null>(null);

const { htmlCode, cssCode, jsCode, activeTab } = storeToRefs(codeStore);
const { status } = storeToRefs(userStore);
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

  // 设置sandbox属性
  previewFrame.value.setAttribute('sandbox', 'allow-scripts  allow-same-origin');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>${cssCode.value}</style>
      </head>
      <body>
        ${htmlCode.value}
        <script>
        // 监听iframe内部的点击事件
          document.addEventListener('click', function(e) {
            // 向父页面发送消息
            window.parent.postMessage({
              type: 'iframe-click',
              target: e.target.tagName,
              timestamp: Date.now()
            }, '*');
          });
        ${jsCode.value}
        <\/script>
      </body>
    </html>
  `);
  doc.close();
}, 500); // 500ms防抖延迟

watch(status, () => {
  debouncedUpdatePreview();
});

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

// 使用防抖的watch监听
watch([htmlCode, cssCode, jsCode], debouncedUpdatePreview, { deep: true });

onMounted(() => {
  debouncedUpdatePreview(); // 初始加载时调用防抖版本

  // 仅在调整大小时禁用 iframe 事件
  const iframe = document.querySelector('.preview-frame') as HTMLIFrameElement;
  iframe?.addEventListener('mouseover', () => {
    if (isResizing.value) {
      document.body.style.cursor = 'col-resize';
    }
  });
  checkShareAccess();
  debouncedUpdatePreview();
});

// 检查是否为分享链接访问
const checkShareAccess = async () => {
<<<<<<< feature-share
  const result = await ShareService.checkShareAccess();

  if (result.success) {
    ShareService.applyShareAccess(result);
  } else {
    console.log(result.error);
=======
  const url = window.location.pathname;
  const shareMatch = url.match(/\/share\/(.+)/);

  if (shareMatch) {
    const shareId = shareMatch[1];
    try {
      console.log('正在加载分享项目...');
      const projectData = await api.getSharedProject(shareId);

      if (projectData.project.ownerId === userStore.userId) {
        permissions.value = {
          isOwner: true,
          accessType: 'owner',
        };
      } else {
        permissions.value = {
          isOwner: false,
          accessType: 'readonly',
        };
      }
      // 设置权限
      userStore.setPermissions(permissions.value);

      // 加载项目数据到编辑器
      codeStore.loadProjectFromShare(projectData);

      // 如果是只读模式，显示提示
      if (permissions.value.accessType === 'readonly') {
        console.log(`您正在以只读模式访问项目: ${projectData.project.name || '未命名项目'}`);
      }

      console.log('分享项目加载完成');
    } catch (error) {
      console.error('Failed to load shared project:', error);
      // 处理错误（如链接过期、不存在等）
      console.log('分享项目加载失败，请检查链接是否有效');
    }
>>>>>>> main
  }
};

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
