<template>
  <footer class="footer" :class="{ expanded: isConsoleExpanded }">
    <div class="tabs">
      <div class="tabs_left">
        <UnifiedButton type="primary" size="small" :active="isConsoleExpanded" @click="toggleConsole">
          Console
        </UnifiedButton>
        <UnifiedButton type="primary" size="small" @click="toggleProjectList">Assets</UnifiedButton>
      </div>
      <div class="tabs_right" ref="tabsRightRef">
        <UnifiedButton type="primary" size="small" :disabled="props.isReadOnly" @click.stop="openShareBox">
          share
        </UnifiedButton>
        <div v-if="isShareExpanded" class="share" ref="shareRef" :style="shareBoxStyle">
          <h2>Share</h2>
          <span class="share_link">{{ shareLink }}</span>
          <UnifiedButton type="primary" size="large" class="copy_link" @click="copyLink">Copy Link</UnifiedButton>
        </div>
      </div>
    </div>

    <!-- 复制提示弹窗 -->
    <div v-if="showCopyToast" class="copy-toast" :class="copyToastType">
      <div class="toast-content" :class="copyToastType">
        <span class="toast-icon">{{ copyToastType === 'success' ? '✓' : '✗' }}</span>
        <span class="toast-text">{{ copyToastMessage }}</span>
        <span class="toast-close" @click="showCopyToast = false">×</span>
      </div>
    </div>

    <!-- 只有点击Console时才显示的内容区域 -->
    <div v-if="isConsoleExpanded" class="console-expanded">
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
          :class="[`log-${log.type}`, { clickable: log.clickable }]"
          @click="handleLogClick(log)"
        >
          <span class="timestamp">{{ formatTime(log.timestamp) }}</span>
          <span class="log-level">[{{ log.type.toUpperCase() }}]</span>
          <span class="log-message">{{ log.message }}</span>
          <span v-if="log.line" class="line-info">
            at line {{ log.line }}{{ log.column ? `:${log.column}` : '' }}
          </span>
        </div>
        <div v-if="consoleLogs.length === 0" class="log-entry"><span class="prompt">></span> Ready</div>
      </div>
      <div class="console-input" ref="commandInputContainer">
        <span class="prompt">></span>
        <textarea
          v-model="command"
          ref="commandInput"
          @keydown="handleKeydown"
          placeholder="Type command here..."
          rows="1"
        ></textarea>
      </div>
    </div>
    <!-- 项目列表对话框 -->
    <ProjectListDialog v-if="isProjectListVisible" :visible="isProjectListVisible" @close="closeProjectList" />
  </footer>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, computed, watch } from 'vue';
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
const consoleLogs = ref<
  Array<{
    type: string;
    message: string;
    timestamp: number;
    line?: number;
    column?: number;
    clickable?: boolean;
    isSyntaxError?: boolean;
  }>
>([]);
const command = ref('');
const consoleOutput = ref<HTMLElement | null>(null);
const commandInput = ref<HTMLTextAreaElement | null>(null);
const commandInputContainer = ref<HTMLElement | null>(null);
// 添加复制提示状态
const showCopyToast = ref(false);
const copyToastType = ref('success'); // 'success' 或 'error'
const copyToastMessage = ref('');

const emit = defineEmits(['login', 'runtime-error', 'goto-line', 'syntax-error']);
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

function executeInSandbox(code: string) {
  try {
    // 1. 创建安全沙箱环境
    const sandbox = {
      console: {
        log: (...args: any[]) => {
          const message = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');

          consoleLogs.value.push({
            type: 'log',
            message,
            timestamp: Date.now(),
          });
        },
        error: (...args: any[]) => {
          const message = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');

          consoleLogs.value.push({
            type: 'error',
            message,
            timestamp: Date.now(),
          });
        },
        warn: (...args: any[]) => {
          const message = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');

          consoleLogs.value.push({
            type: 'warn',
            message,
            timestamp: Date.now(),
          });
        },
      },
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      setInterval: setInterval,
      clearInterval: clearInterval,
      Math: Math,
      JSON: JSON,
      Date: Date,
    };

    // 2. 安全执行代码
    const execute = new Function(
      'sandbox',
      `
      with(sandbox) {
        try {
          // 使用完整的块语句
          (function executeCode() {
            ${code}
          })();
        } catch(e) {
          // 捕获并处理真正的错误
          console.error(e);
        }
      }
    `
    );

    // 3. 执行并处理结果
    const result = execute(sandbox);

    // 4. 处理返回结果（非console输出）
    if (result !== undefined) {
      consoleLogs.value.push({
        type: 'result',
        message: typeof result === 'object' ? JSON.stringify(result) : String(result),
        timestamp: Date.now(),
      });
    }

    return true;
  } catch (error) {
    // 5. 捕获执行错误
    consoleLogs.value.push({
      type: 'error',
      message: error.message,
      timestamp: Date.now(),
    });
    return false;
  }
}

// 处理键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault(); // 阻止默认的换行行为
    executeCommand();
  }
};

const executeCommand = () => {
  const cmd = command.value.trim();
  if (cmd) {
    // 添加命令日志
    consoleLogs.value.push({
      type: 'command',
      message: cmd,
      timestamp: Date.now(),
    });

    // 执行命令
    executeInSandbox(cmd);

    // 清空输入并滚动到底部
    command.value = '';
    scrollToBottom();

    // 下次tick后聚焦输入框
    nextTick(() => {
      const input = commandInput.value;
      if (input) {
        input.focus();
        input.style.height = '1.5em'; // 保持一行高度
      }
    });
  }
};

// 自动调整文本域高度
watch(command, (newVal) => {
  nextTick(() => {
    const input = commandInput.value;
    if (input) {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 200) + 'px';
    }
  });
});

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
const handleLogClick = (logItem) => {
  // 确保传递有效的行号
  if (logItem.line !== undefined && !isNaN(logItem.line)) {
    emit('goto-line', {
      line: logItem.line,
      type: logItem.errorType || 'js',
    });
  } else {
    console.error('无效的行号:', logItem.line);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (consoleOutput.value) {
      consoleOutput.value.scrollTop = consoleOutput.value.scrollHeight;
    }
  });
};

const tabsRightRef = ref<HTMLElement | null>(null);
const shareBoxStyle = computed(() => {
  if (!tabsRightRef.value) return {};

  const bottomValue = isConsoleExpanded.value ? `${tabsRightRef.value.offsetHeight}px` : '1.75rem';

  return {
    bottom: bottomValue,
    right: '-0.7rem',
  };
});

// 获取分享链接
const getProjectShareLink = async () => {
  try {
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
    // 显示复制成功提示
    copyToastType.value = 'success';
    copyToastMessage.value = `Copied Url to Clipboard!${shareTime.value ? ` The link is valid until ${shareTime.value}` : ''}`;
    showCopyToast.value = true;
    // 3秒后自动隐藏提示
    setTimeout(() => {
      showCopyToast.value = false;
    }, 3000);
  } catch (err) {
    // 显示复制失败提示
    copyToastType.value = 'error';
    copyToastMessage.value = 'Failed to copy link to clipboard!';
    showCopyToast.value = true;
    // 3秒后自动隐藏提示
    setTimeout(() => {
      showCopyToast.value = false;
    }, 3000);
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
    const lineNumber = event.data.line;
    const columnNumber = event.data.column;

    consoleLogs.value.push({
      type: event.data.level,
      message: event.data.args.join(' '),
      timestamp: event.data.timestamp,
      line: lineNumber,
      column: columnNumber,
      clickable: !!lineNumber, // 只有有行号的日志才可点击
    });

    scrollToBottom();
  } else if (event.data && event.data.type === 'runtime-error') {
    // 处理运行时错误
    let errorMessage = event.data.message;
    let lineNumber = event.data.line;
    let columnNumber = event.data.column;
    const errorType = event.data.errorType || 'js';

    consoleLogs.value.push({
      type: 'error',
      message: errorMessage,
      timestamp: event.data.timestamp,
      line: lineNumber,
      column: columnNumber,
      clickable: !!lineNumber, // 只有有行号的错误才可点击
    });

    // 触发编辑器错误高亮
    if (lineNumber) {
      emit('runtime-error', {
        line: lineNumber,
        column: columnNumber,
        message: errorMessage,
        type: errorType, // 添加错误类型
      });
    }
    scrollToBottom();
  }
  // 处理语法错误
  else if (event.data && event.data.type === 'syntax-error') {
    consoleLogs.value.push({
      type: 'error',
      message: event.data.message,
      timestamp: event.data.timestamp,
      clickable: false,
      isSyntaxError: true,
    });

    // 触发语法错误事件
    emit('syntax-error', {
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
});
</script>

<style scoped>
/* 初始状态只有选项卡按钮 */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  height: 40px;
  background: #1a1a1a;
  border-top: 1px solid #333;
  transition: all 0.3s;
}

/* 展开状态 */
.footer.expanded {
  max-height: 80vh;
  height: auto;
  z-index: 1000;
  border-top: 2px solid #333;
}

.tabs {
  height: 5vh;
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
}

.tabs_right {
  position: relative;
}

.share {
  position: absolute;
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
  }
  to {
    opacity: 1;
  }
}

/* 复制提示弹窗样式 */
.copy-toast {
  position: fixed;
  top: 20px;
  right: 50%;
  transform: translateX(50%);
  z-index: 9999;
  animation:
    slideInDown 0.3s ease-out,
    slideOutUp 0.3s ease-in 2.7s forwards;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  min-height: 40px;
  color: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: 500;
  position: relative;
  max-width: 500px;
}

/* 成功样式 */
.toast-content.success {
  /* background: #4caf50; */
  border: 2px solid #45a049;
}

.copy-toast.success .toast-icon {
  font-size: 16px;
  font-weight: bold;
  color: white;
}

/* 失败样式 */
.toast-content.error {
  background: #f44336;
  border: 2px solid #d32f2f;
}

.copy-toast.error .toast-icon {
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.toast-text {
  flex: 1;
  word-wrap: break-word;
}

.toast-close {
  position: absolute;
  top: 2px;
  right: 2px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
  padding: 2px;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.toast-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

@keyframes slideInDown {
  from {
    transform: translateX(50%) translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(50%) translateY(0);
    opacity: 1;
  }
}

@keyframes slideOutUp {
  from {
    transform: translateX(50%) translateY(0);
    opacity: 1;
  }
  to {
    transform: translateX(50%) translateY(-100%);
    opacity: 0;
  }
}

/* 控制台展开后的样式 */
.console-expanded {
  display: flex;
  flex-direction: column;
  min-height: 150px;
  background: #0a0a0a;
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

.console-output {
  flex: 1 1 auto;
  min-height: 200px;
  max-height: 300px;
  padding: 0.5rem 1rem;
  overflow-y: auto;
  white-space: pre-wrap;
}

.log-entry {
  color: #ccc;
  margin: 5px 0;
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

.log-entry.clickable {
  cursor: pointer;
}

.log-entry.clickable:hover {
  background: #3a3a3a;
}

.log-entry.clickable .line-info {
  color: #61dafb;
  text-decoration: underline;
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

.log-entry.log-result {
  border-left: 3px solid #61dafb;
  background-color: rgba(97, 218, 251, 0.1);
}

.log-entry.log-result .log-level {
  color: #61dafb;
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

.line-info {
  color: #888;
  font-size: 11px;
  font-style: italic;
}

.prompt {
  color: #4caf50;
}

.console-input {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  background: #1a1a1a;
  border-top: 1px solid #333;
}

.console-input textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  padding: 0.25rem 0.5rem;
  outline: none;
  resize: none;
  font-size: 0.85rem;
  height: auto;
  min-height: 1.5em;
  line-height: 1.5;
}
</style>
