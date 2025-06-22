<template>
  <footer class="footer" :class="{ expanded: isConsoleExpanded }">
    <div class="tabs">
      <button :class="{ active: isConsoleExpanded }" @click="toggleConsole">Console</button>
      <!-- 目前是关闭窗口之后可以改为切换 -->
      <button @click="closeConsole">Assets</button>
      <button @click="closeConsole">Shortcuts</button>
    </div>

    <!-- 只有点击Console时才显示的内容区域 -->
    <div v-if="isConsoleExpanded" class="console-expanded">
      <div class="console-header">
        <span>Console</span>
        <div class="console-actions">
          <button class="clear-btn" @click="clearConsole">Clear</button>
          <button class="close-btn" @click="closeConsole">×</button>
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
import { ref, nextTick } from 'vue';

const isConsoleExpanded = ref(false);
const consoleLogs = ref<string[]>([]);
const command = ref('');
const consoleOutput = ref<HTMLElement | null>(null);

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
</script>

<style scoped>
/* 初始状态只有选项卡按钮 */
.footer {
  height: 40px;
  background: #1a1a1a;
  border-top: 1px solid #333;
}

/* 展开状态 */
.footer.expanded {
  height: 250px;
}

.tabs {
  display: flex;
  background: #1a1a1a;
  padding: 0.25rem;
  gap: 0.5rem;
  border-bottom: 1px solid #333;
}

.tabs button {
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
}

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

.clear-btn,
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
}

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
