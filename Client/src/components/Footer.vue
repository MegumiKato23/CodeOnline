<template>
  <footer class="footer" :class="{ expanded: isConsoleExpanded }">
    <div class="tabs">
      <div class="tabs_left">
        <UnifiedButton type="primary" size="small" :active="isConsoleExpanded" @click="toggleConsole">
          Console
        </UnifiedButton>
        <UnifiedButton type="primary" size="small" @click="closeConsole">Assets</UnifiedButton>
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
    <div v-if="isConsoleExpanded" class="console-expanded">
      <div class="console-header">
        <span>Console</span>
        <div class="console-actions">
          <UnifiedButton type="primary" size="small" @click="clearConsole">Clear</UnifiedButton>
          <UnifiedButton type="primary" size="small" @click="closeConsole">×</UnifiedButton>
        </div>
      </div>
      <div class="console-output" ref="consoleOutput">
        <div v-for="(log, index) in consoleLogs" :key="index" class="log-entry">
          <span class="prompt">></span> {{ log }}
        </div>
        <div v-if="consoleLogs.length === 0" class="log-entry"><span class="prompt">></span> Ready</div>
      </div>
      <div class="console-input">
        <span class="prompt">></span>
        <input v-model="command" type="text" @keyup.enter="executeCommand" placeholder="Type command here..." />
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { api } from '@/api/index';

const userStore = useUserStore();
const props = defineProps<{
  isReadOnly?: boolean;
}>();
const isConsoleExpanded = ref(false);
const isShareExpanded = ref(false);
const shareRef = ref(null);
const shareLink = ref(window.location.origin);
const shareTime = ref(null);
const consoleLogs = ref<string[]>([]);
const command = ref('');
const consoleOutput = ref<HTMLElement | null>(null);
// 添加复制提示状态
const showCopyToast = ref(false);


const emit = defineEmits(['login']);
import UnifiedButton from '@/components/ui/UnifiedButton.vue';

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
    consoleLogs.value.push(command.value);
    command.value = '';
    scrollToBottom();
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (consoleOutput.value) {
      consoleOutput.value.scrollTop = consoleOutput.value.scrollHeight;
    }
  });
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
    // 生成完整的分享链接
    console.log(window.location.origin);
    shareLink.value = `${window.location.origin}/share/${response.shareId}`;

    shareTime.value = new Date(response.expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    console.log('获取分享链接成功:', shareLink.value);
    // console.log(time);
  } catch (error) {
    console.error('获取分享链接失败:', error);
    // 失败时使用默认链接
    shareLink.value = window.location.origin;
  }
};

const openShareBox = async () => {
  if (!userStore.isLoggedIn) {
    emit('login');
  } else {
    await getProjectShareLink();
    isShareExpanded.value = true;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 35px;
  background: #1a1a1a;
  border-top: 1px solid #333;
}

/* 展开状态 */
.footer.expanded {
  height: 40%;
}

.tabs {
  height: 30px;
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
  width: 200px;
  height: 150px;
  padding: 10px 15px;
  background-color: rgb(30, 31, 38);
  animation: shareBox 0.3s ease forwards;
}

.share_link {
  width: 180px;
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
    bottom: 35px;
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
  height: calc(100% - 40px);
  background: #0a0a0a;
  font-family: 'Courier New', monospace;
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
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
  margin-bottom: 0.25rem;
  line-height: 1.4;
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
