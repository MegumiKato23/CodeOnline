<template>
  <div class="app">
    <Navbar @login="showLoginDialog = true"  @openSettings="showSettings = true"/>
    <div class="left" ref="view">
      <div class="main-content">
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
    </div>
    <Footer :isReadOnly="userStore.isReadOnlyMode" @login="showLoginDialog = true" />
    <SettingDialog :dialogFormVisible="showSettings" @closeDialog="showSettings = false" />
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
import SettingDialog from '@/components/dialogs/SettingDialog.vue';
import LoginDialog from '@/components/login/LoginDialog.vue';
import RegisterDialog from '@/components/login/RegisterDialog.vue';
import head_portrait from './components/head_portrait.vue';
import { api } from '@/api/index';
import { Users } from 'lucide-vue-next';
import { ShareService } from '@/services/shareService';

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
const view = ref<HTMLElement | null>(null);
console.log(view);
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
  view.value.className = '';
  view.value.classList.add(status.value);
  debouncedUpdatePreview();
});

// //切换到settings界面
// const switchToSettings = () => {
//   //console.log(showSettings.value)
//   showSettings.value = true;
//   //console.log(showSettings.value)
// }

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
const handleBeforeUnload = async (e) => {
  if (!userStore.isLoggedIn) return;

  e.preventDefault();
  const msg = '正在保存代码，请稍候...';
  e.returnValue = msg;

  try {
    // 1. 获取当前项目ID
    const currentProjectId = userStore.currentProjectId;
    console.log('当前项目ID:', userStore);
    if (!currentProjectId) throw new Error('未设置当前项目');

    // 2. 从Redis获取文件内容（保持原有逻辑）
    const codeResponse = await api.getCode(userStore.account);
    const filesToUpdate = codeResponse.data?.files || [];
    console.log('待更新文件:', filesToUpdate);
    if (filesToUpdate.length === 0) return;

    // 3. 获取项目文件列表（采用标准API调用方式）
    const projectResponse = await api.getProject(currentProjectId);
    const projectData = projectResponse.data?.project || projectResponse.data;
    const existingFiles = projectData?.files || [];
    console.log('现有文件列表:', existingFiles);

    // 4. 创建文件名到ID的映射
    const fileIdMap = new Map();
    existingFiles.forEach((file) => {
      fileIdMap.set(file.name, file.id);
    });
    console.log('文件ID映射表:', Object.fromEntries(fileIdMap));

    // 5. 执行文件更新（带错误收集）
    const updateResults = await Promise.all(
      filesToUpdate.map(async (file) => {
        try {
          const fileId = fileIdMap.get(file.name);
          if (!fileId) {
            console.warn(`未找到文件 ${file.name} 的ID，跳过更新`);
            return { name: file.name, status: 'skipped' };
          }

          console.log(`正在更新 ${file.name} (ID: ${fileId})`);
          const updateResponse = await api.updateFile(currentProjectId, fileId, {
            name: file.name,
            path: file.path,
            content: file.content,
            type: file.type,
          });

          // 验证更新结果
          if (updateResponse.code !== 200) {
            throw new Error(updateResponse.message || '更新失败');
          }

          return { name: file.name, status: 'success' };
        } catch (error) {
          console.error(`文件 ${file.name} 更新失败:`, error);
          return {
            name: file.name,
            status: 'failed',
            error: error.message,
          };
        }
      })
    );

    // 6. 检查更新结果
    const failedUpdates = updateResults.filter((r) => r.status === 'failed');
    if (failedUpdates.length > 0) {
      console.error('以下文件更新失败:', failedUpdates);
      throw new Error(`${failedUpdates.length}个文件更新失败`);
    }

    console.log('文件更新完成:', {
      success: updateResults.filter((r) => r.status === 'success').length,
      skipped: updateResults.filter((r) => r.status === 'skipped').length,
    });
    delete e.returnValue;
  } catch (error) {
    console.error('自动保存失败:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return msg;
  }
};
onMounted(() => {
  debouncedUpdatePreview(); // 初始加载时调用防抖版本
  window.addEventListener('beforeunload', handleBeforeUnload);
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
  const result = await ShareService.checkShareAccess();

  if (result.success) {
    ShareService.applyShareAccess(result);
  } else {
    console.log(result.error);
  }
};

// 组件卸载时取消防抖
onBeforeUnmount(() => {
  debouncedUpdatePreview.cancel();
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<style>
@import '../viewStyle.css';
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
</style>
