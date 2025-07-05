<template>
  <footer class="footer" :class="{ expanded: isConsoleExpanded }">
    <div class="tabs">
      <div class="tabs_left">
        <UnifiedButton type="primary" size="small" :active="isConsoleExpanded" @click="toggleConsole">
          Console
        </UnifiedButton>
        <UnifiedButton type="primary" size="small" @click="toggleProjectList">Assets</UnifiedButton>
      </div>
      <div class="tabs_right">
        <UnifiedButton type="primary" size="small" :disabled="props.isReadOnly" @click.stop="openShareBox">
          share
        </UnifiedButton>
        <div v-if="isShareExpanded" class="share" ref="shareRef">
          <h2>Share</h2>
          <span class="share_link">{{ shareLink }}</span>
          <UnifiedButton type="primary" size="large" class="copy_link" @click="copyLink">Copy Link</UnifiedButton>
        </div>
      </div>
    </div>

    <!-- 复制成功提示弹窗 -->
    <div v-if="showCopyToast" class="copy-toast">
      <div class="toast-content">
        <span class="toast-icon">✓</span>
        <span class="toast-text"
          >Copied Url to Clipboard!
          <span v-if="shareTime">The link is valid until {{ shareTime }}</span>
        </span>
      </div>
    </div>

    <!-- 只有点击Console时才显示的内容区域 -->
    <div v-if="isConsoleExpanded" class="console-expanded" :style="{ height: consoleHeight + 'px' }">
      <!-- 拖拽调整大小的条 -->
      <div class="resize-handle" @mousedown="startResize"></div>
      <div class="console-header">
        <span>Console</span>
        <div class="console-actions">
          <UnifiedButton type="primary" size="small" @click="clearConsole">Clear</UnifiedButton>
          <UnifiedButton type="primary" size="small" @click="closeConsole">×</UnifiedButton>
        </div>
      </div>
      <div class="console-output" ref="consoleOutput">
        <div
          v-for="(log, index) in consoleLogs"
          :key="index"
          class="log-entry"
          :class="`log-${log.type}`"
          @click="handleLogClick(log)"
        >
          <span class="timestamp">{{ formatTime(log.timestamp) }}</span>
          <span class="log-level">[{{ log.type.toUpperCase() }}]</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
        <div v-if="consoleLogs.length === 0" class="log-entry"><span class="prompt">></span> Ready</div>
      </div>
      <div class="console-input">
        <span class="prompt">></span>
        <input v-model="command" type="text" @keyup.enter="executeCommand" placeholder="Type command here..." />
      </div>
    </div>
    <!-- 项目列表对话框 -->
    <ProjectListDialog v-if="isProjectListVisible" :visible="isProjectListVisible" @close="closeProjectList" />
  </footer>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { api } from '@/api/index';
import ProjectListDialog from '@/components/project/ProjectListDialog.vue';

const userStore = useUserStore();
const props = defineProps<{
  isReadOnly?: boolean;
}>();
const isConsoleExpanded = ref(false);
const isShareExpanded = ref(false);
const isProjectListVisible = ref(false);
const shareRef = ref(null);
const shareLink = ref(window.location.origin);
const shareTime = ref(null);
const consoleLogs = ref<Array<{ type: string; message: string; timestamp: number; line?: number }>>([]);
const command = ref('');
const consoleOutput = ref<HTMLElement | null>(null);
// 添加复制提示状态
const showCopyToast = ref(false);
// 控制台高度相关
const consoleHeight = ref(300); // 默认高度
const isResizing = ref(false);
const startY = ref(0);
const startHeight = ref(0);

const emit = defineEmits(['login', 'runtime-error', 'goto-line']);
import UnifiedButton from '@/components/ui/UnifiedButton.vue';

const toggleProjectList = () => {
  if (!userStore.isLoggedIn) {
    emit('login');
    return;
  }
  isProjectListVisible.value = true;
  isConsoleExpanded.value = false;
};

const closeProjectList = () => {
  isProjectListVisible.value = false;
};

const toggleConsole = () => {
  isConsoleExpanded.value = !isConsoleExpanded.value;
};

const clearConsole = () => {
  consoleLogs.value = [];
};

const closeConsole = () => {
  isConsoleExpanded.value = false;
};

const executeCommand = () => {
  if (command.value.trim()) {
    consoleLogs.value.push({
      type: 'command',
      message: command.value,
      timestamp: Date.now(),
    });
    command.value = '';
    scrollToBottom();
  }
};

// 格式化时间戳
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 处理日志点击事件（用于错误跳转）
const handleLogClick = (log: any) => {
  if (log.type === 'error' && log.line) {
    emit('goto-line', log.line);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (consoleOutput.value) {
      consoleOutput.value.scrollTop = consoleOutput.value.scrollHeight;
    }
  });
};

// 开始拖拽调整大小
const startResize = (e: MouseEvent) => {
  e.preventDefault();
  isResizing.value = true;
  startY.value = e.clientY;
  startHeight.value = consoleHeight.value;

  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  document.body.style.cursor = 'ns-resize';
  document.body.style.userSelect = 'none';
};

// 处理拖拽过程
const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return;

  const deltaY = startY.value - e.clientY; // 向上拖拽为正值
  const newHeight = startHeight.value + deltaY;

  // 限制最小和最大高度
  const minHeight = 150;
  const maxHeight = window.innerHeight * 0.8;

  consoleHeight.value = Math.max(minHeight, Math.min(maxHeight, newHeight));
};

// 停止拖拽
const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
};

// 获取分享链接
const getProjectShareLink = async () => {
  try {
    // if (!userStore.isLoggedIn) {
    //   console.warn('用户未登录，无法获取分享链接');
    //   shareLink.value = baseUrl.value;
    //   return;
    // }

    const response = await api.getShareLink(userStore.currentProjectId);
    const { data } = response;
    // 生成完整的分享链接
    console.log(window.location.origin);
    shareLink.value = `${window.location.origin}/share/${data.shareId}`;

    shareTime.value = new Date(data.expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    console.log('获取分享链接成功:', shareLink.value);
  } catch (error) {
    console.error('获取分享链接失败:', error);
    // 失败时使用默认链接
    shareLink.value = window.location.origin;
  }
};

const openShareBox = async () => {
  if (!userStore.isLoggedIn) {
    emit('login');
    return;
  }

  try {
    // 1. 先保存Redis数据到数据库
    await saveRedisToDatabase();

    // 2. 获取分享链接
    await getProjectShareLink();

    // 3. 显示分享框
    isShareExpanded.value = true;
  } catch (error) {
    console.error('分享准备失败:', error);
    // 可以添加用户提示
    alert('准备分享链接失败，请稍后再试');
  }
};
const saveRedisToDatabase = async () => {
  try {
    // 1. 获取当前项目ID
    const currentProjectId = userStore.currentProjectId;
    if (!currentProjectId) {
      throw new Error('未设置当前项目');
    }

    // 2. 从Redis获取文件内容
    const codeResponse = await api.getCode(userStore.account);
    const filesToUpdate = codeResponse.data?.files || [];
    if (filesToUpdate.length === 0) {
      console.log('没有需要保存的文件');
      return;
    }

    // 3. 获取项目文件列表
    const projectResponse = await api.getProject(currentProjectId);
    const projectData = projectResponse.data?.project || projectResponse.data;
    const existingFiles = projectData?.files || [];

    // 4. 创建文件名到ID的映射
    const fileIdMap = new Map();
    existingFiles.forEach((file) => {
      fileIdMap.set(file.name, file.id);
    });

    // 5. 执行文件更新
    const updatePromises = filesToUpdate.map(async (file) => {
      const fileId = fileIdMap.get(file.name);
      if (!fileId) {
        console.warn(`未找到文件 ${file.name} 的ID，跳过更新`);
        return { name: file.name, status: 'skipped' };
      }

      try {
        const updateResponse = await api.updateFile(currentProjectId, fileId, {
          name: file.name,
          path: file.path,
          content: file.content,
          type: file.type,
        });

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
    });

    // 等待所有更新完成
    const updateResults = await Promise.all(updatePromises);

    // 检查失败情况
    const failedUpdates = updateResults.filter((r) => r.status === 'failed');
    if (failedUpdates.length > 0) {
      throw new Error(`${failedUpdates.length}个文件更新失败`);
    }

    console.log('Redis数据保存成功:', {
      success: updateResults.filter((r) => r.status === 'success').length,
      skipped: updateResults.filter((r) => r.status === 'skipped').length,
    });
  } catch (error) {
    console.error('保存Redis数据失败:', error);
    throw error; // 抛出错误让上层处理
  }
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value);
    console.log('复制成功');
    // 显示复制成功提示
    showCopyToast.value = true;
    // 2秒后自动隐藏提示
    setTimeout(() => {
      showCopyToast.value = false;
    }, 1000);
  } catch (err) {
    console.error('复制失败 ', err);
  }
};

// 外部点击处理
function handleClickOutside(e: MouseEvent) {
  // 点击分享弹窗外部
  if (shareRef.value && !shareRef.value.contains(e.target)) {
    isShareExpanded.value = false;
  }
}

// 处理来自iframe的消息
function handleIframeMessage(event: MessageEvent) {
  // 验证消息来源和类型
  if (event.data && event.data.type === 'iframe-click') {
    console.log('收到iframe点击消息:', event.data);
    // 触发handleClickOutside逻辑
    if (isShareExpanded.value) {
      isShareExpanded.value = false;
    }
  } else if (event.data && event.data.type === 'console-log') {
    // 处理console日志
    consoleLogs.value.push({
      type: event.data.level,
      message: event.data.args.join(' '),
      timestamp: event.data.timestamp,
    });
    scrollToBottom();
  } else if (event.data && event.data.type === 'runtime-error') {
    // 处理运行时错误
    const errorMessage = event.data.line ? `Line ${event.data.line}: ${event.data.message}` : event.data.message;

    consoleLogs.value.push({
      type: 'error',
      message: errorMessage,
      timestamp: event.data.timestamp,
      line: event.data.line,
    });

    // 触发编辑器错误高亮
    emit('runtime-error', {
      line: event.data.line,
      message: event.data.message,
    });
    scrollToBottom();
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  // 监听来自iframe的postMessage
  window.addEventListener('message', handleIframeMessage);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  // 移除postMessage监听
  window.removeEventListener('message', handleIframeMessage);
  // 清理拖拽事件监听器
  if (isResizing.value) {
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
});
</script>

<style scoped>
/* 初始状态只有选项卡按钮 */
.footer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 40px;
  background: #1a1a1a;
  border-top: 1px solid #333;
}

/* 展开状态 */
.footer.expanded {
  height: 45%;
}

.tabs {
  height: 40px;
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tabs_left {
  display: flex;
  background: #1a1a1a;
  padding: 0.25rem;
  gap: 0.5rem;
  border-bottom: 1px solid #333;
}

.tabs_right {
  display: flex;
}

.share {
  position: absolute;
  /* bottom: 35px; */
  right: 0;
  /* align-items: center; */
  border: 1px solid #333;
  width: 245px;
  height: 140px;
  padding: 10px 15px;
  background-color: #1a1a1a;
  border: transparent;
  border-top-left-radius: 4px;
  animation: shareBox 0.3s ease forwards;
}

.share_link {
  font-size: 10px;
}

.copy_link {
  margin-top: 10px;
  width: 100%;
  background-color: hsl(226, 28%, 69%);
}

.copy_link:hover {
  background-color: hsl(225, 75%, 75%) !important;
}

@keyframes shareBox {
  from {
    opacity: 0;
    bottom: 0;
  }
  to {
    opacity: 1;
    bottom: 2.15rem;
  }
}

/* 复制成功提示弹窗样式 */
.copy-toast {
  position: fixed;
  top: 5px;
  right: 50%;
  transform: translateX(50%);
  z-index: 9999;
  animation: slideInRight 0.2s ease-out;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  height: 40px;
  color: white;
  border: 2px solid #4caf50;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: 500;
}

.toast-icon {
  font-size: 16px;
  font-weight: bold;
  color: #4caf50;
}

.toast-text {
  white-space: nowrap;
}

@keyframes slideInRight {
  from {
    /* transform: translateX(100%); */
    /* top: 5px; */
    opacity: 0;
  }
  to {
    /* transform: translateX(0); */
    /* top: 50px; */
    opacity: 1;
  }
}
/* .tabs button {
  padding: 0.4rem 1rem;
  background: #2a2a2a;
  color: #ccc;
  border: none;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  font-size: 0.9rem;
}

.tabs button.active {
  background: #333;
  color: white;
}

.tabs button:hover {
  background: #333;
} */

/* 控制台展开后的样式 */
.console-expanded {
  display: flex;
  flex-direction: column;
  background: #0a0a0a;
  font-family: 'Courier New', monospace;
  position: relative;
}

/* 拖拽调整大小的条 */
.resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #333;
  cursor: ns-resize;
  z-index: 10;
  transition: background-color 0.2s;
}

.resize-handle:hover {
  background: #555;
}

.resize-handle:active {
  background: #777;
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  padding-top: 8px; /* 为拖拽条留出空间 */
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}

.console-actions {
  display: flex;
  gap: 0.5rem;
}

/* .clear-btn,
.close-btn {
  background: transparent;
  color: #ccc;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.clear-btn:hover {
  color: white;
}

.close-btn {
  font-size: 1.1rem;
  line-height: 1;
}

.close-btn:hover {
  color: #ff5555;
} */

.console-output {
  flex: 1;
  padding: 0.5rem 1rem;
  overflow-y: auto;
  white-space: pre-wrap;
}

.log-entry {
  color: #ccc;
  margin: 2px 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  display: flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 2px;
  cursor: pointer;
  line-height: 1.4;
}

.log-entry:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.log-entry.log-error {
  background-color: rgba(255, 0, 0, 0.1);
  border-left: 3px solid #ff4444;
}

.log-entry.log-error:hover {
  background-color: rgba(255, 0, 0, 0.2);
}

.log-entry.log-warn {
  background-color: rgba(255, 165, 0, 0.1);
  border-left: 3px solid #ffa500;
}

.log-entry.log-log {
  border-left: 3px solid #00ff00;
}

.log-entry.log-command {
  border-left: 3px solid #0099ff;
  background-color: rgba(0, 153, 255, 0.1);
}

.timestamp {
  color: #666;
  font-size: 10px;
  margin-right: 8px;
  min-width: 60px;
}

.log-level {
  font-weight: bold;
  margin-right: 8px;
  min-width: 50px;
}

.log-entry.log-error .log-level {
  color: #ff4444;
}

.log-entry.log-warn .log-level {
  color: #ffa500;
}

.log-entry.log-log .log-level {
  color: #00ff00;
}

.log-entry.log-command .log-level {
  color: #0099ff;
}

.log-message {
  flex: 1;
  word-break: break-word;
}

.prompt {
  color: #4caf50;
}

.console-input {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #1a1a1a;
  border-top: 1px solid #333;
}

.console-input input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-family: 'Courier New', monospace;
  padding: 0.25rem 0.5rem;
  outline: none;
}
</style>
