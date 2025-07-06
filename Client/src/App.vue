<template>
  <div class="app">
    <Navbar @login="showLoginDialog = true" @openSettings="showSettings = true" />
    <div class="left" ref="view">
      <div class="main-content">
        <div class="editor-panel" ref="editorPanel">
          <CodeEditor
            :activeTab="activeTab"
            :isReadOnly="userStore.isReadOnlyMode"
            :cssSyntax="cssSyntax"
            :framework="framework"
          />
        </div>
        <div class="resize-handle" @mousedown="startResize" @dblclick="resetSize"></div>
        <div class="preview-panel">
          <iframe
            sandbox="allow-scripts allow-same-origin allow-modals"
            ref="previewFrame"
            class="preview-frame"
            :class="{ 'no-pointer-events': isResizing }"
            csp="script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
          ></iframe>
        </div>
      </div>
    </div>
    <Footer
      :isReadOnly="userStore.isReadOnlyMode"
      @login="showLoginDialog = true"
      @runtime-error="handleRuntimeError"
      @goto-line="handleGotoLine"
    />
    <SettingDialog
      :dialogFormVisible="showSettings"
      @closeDialog="showSettings = false"
      @updateSettings="handleSettingsUpdate"
    />
    <LoginDialog :visible="showLoginDialog" @close="showLoginDialog = false" @register="switchToRegister()" />
    <RegisterDialog :visible="showRegisterDialog" @close="showRegisterDialog = false" @login="switchToLogin()" />
    <!-- <head_portrait @login="showLoginDialog = true" /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, isReadonly } from 'vue';
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
import less from 'less';
import * as sass from 'sass';
import { SecurityService } from '@/services/security';

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
const cssSyntax = ref<'css' | 'sass' | 'less'>('css');
const framework = ref<'' | 'vue' | 'react'>('');

const handleSettingsUpdate = (frameworkVal: '' | 'vue' | 'react', syntax: 'css' | 'sass' | 'less') => {
  cssSyntax.value = syntax;
  framework.value = frameworkVal;
};
// 创建防抖的预览更新函数 (500ms)
const debouncedUpdatePreview = debounce(async () => {
  if (!previewFrame.value) return;

  const doc = previewFrame.value.contentDocument;
  if (!doc) return;
  // 检查内容安全性
  if (SecurityService.hasXSS(htmlCode.value) || SecurityService.hasXSS(jsCode.value)) {
    console.warn('检测到潜在XSS风险，已阻止执行');
    return;
  }

  // 使用不同的净化方法
  let safeHTML = SecurityService.sanitizeForWrite(htmlCode.value);
  let safeJS = SecurityService.sanitizeForWrite(jsCode.value);
  console.log(safeHTML);
  if (framework.value === 'vue') {
    const result = `
      <div id="app"><\/div>
      <script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>
      <script>
        const { createApp } = Vue;
        const appConfig = { template: \`${safeHTML}\` };
        const userConfig = (function() { ${safeJS} })();
        Object.assign(appConfig, userConfig);
        const app = createApp(appConfig);
        app.mount('#app');
      <\/script>
    `;
    safeHTML = result;
    console.log(safeHTML)
  } else if (framework.value === 'react') {
    const result = `
      <div id="root"></div>
      <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
      <script type="text/babel">
        ${safeJS};
        const { createRoot } = ReactDOM;
        const root = createRoot(document.getElementById('root'));
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = \`${safeHTML}\`;
        // 转换为 React 元素
        const renderContent = ReactDOM.createRoot(tempDiv)._internalRoot.current.child;
        root.render(<React.StrictMode>{renderContent}<\/React.StrictMode>);
      <\/script>
    `;
    safeHTML = result;
  }
  let safeCSS = cssCode.value; // CSS不需要特殊处理
  if (cssSyntax.value === 'less') {
    try {
      const result = await less.render(cssCode.value);
      safeCSS = result.css;
    } catch (error) {
      console.error('Less 编译失败:', error);
    }
  }
  if (cssSyntax.value === 'sass') {
    try {
      const result = sass.compileString(cssCode.value);
      safeCSS = result.css;
    } catch (error) {
      console.error('Sass 编译失败:', error);
    }
  }
  // 设置sandbox属性
  previewFrame.value.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-modals');
  try {
    // 安全地转义用户代码，避免模板字符串语法冲突
    const escapeForTemplate = (code: string) => {
      return code
        .replace(/\\/g, '\\\\') // 转义反斜杠
        .replace(/`/g, '\\`') // 转义反引号
        .replace(/\$/g, '\\$') // 转义美元符号
        .replace(/\r\n/g, '\\n') // 转义Windows换行符
        .replace(/\n/g, '\\n') // 转义Unix换行符
        .replace(/\r/g, '\\n'); // 转义Mac换行符
    };

    const safeJsCode = escapeForTemplate(jsCode.value);

    const fullContent = `
    <!DOCTYPE html>
    <html>
      <head>
       <meta http-equiv="Content-Security-Policy" content="
>>>>>>> 145273174db8d22ffea69dbd364be0660969268d
            default-src 'none';
            script-src 'self' 'unsafe-inline';
            style-src 'self' 'unsafe-inline';
          ">
        <style>${safeCSS}</style>
      </head>
      <body>
       ${safeHTML}
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
          
          // 重写console方法
          if (typeof window._internalOriginalConsole === 'undefined') {
            window._internalOriginalConsole = window.console;
            window.console = {
              log: function(...args) {
                window.parent.postMessage({
                  type: 'console-log',
                  level: 'log',
                  args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)),
                  timestamp: Date.now()
                }, '*');
                window._internalOriginalConsole.log(...args);
              },
              error: (...args) => {
                window.parent.postMessage({
                  type: 'console-log',
                  level: 'error',
                  args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)),
                  timestamp: Date.now()
                }, '*');
                window._internalOriginalConsole.error(...args);
              },
              warn: (...args) => {
                window.parent.postMessage({
                  type: 'console-log',
                  level: 'warn',
                  args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)),
                  timestamp: Date.now()
                }, '*');
                window._internalOriginalConsole.warn(...args);
              }
            };
          }
          
          // 在iframe中添加错误监听
          window.onerror = function(message, source, lineno, colno, error) {
            // 计算实际代码行号（需要减去HTML包装的行数）
            const htmlWrapperLines = 8;
            const actualLine = Math.max(1, lineno - htmlWrapperLines);
            
            window.parent.postMessage({
              type: 'runtime-error',
              message: message,
              line: actualLine,
              column: colno,
              error: error ? error.stack : null,
              timestamp: Date.now()
            }, '*');
          };

          // 捕获Promise rejection错误
          window.addEventListener('unhandledrejection', function(event) {
            window.parent.postMessage({
              type: 'runtime-error',
              message: event.reason.message || 'Unhandled Promise Rejection',
              error: event.reason.stack,
              timestamp: Date.now()
            }, '*');
          });

          // 语法错误检测（在代码执行前）
          try {
            new Function(\` ${safeJS}\`);
          } catch (syntaxError) {
            window.parent.postMessage({
              type: 'runtime-error',
              message: 'Syntax Error: ' + syntaxError.message,
              error: syntaxError.stack,
              timestamp: Date.now()
            }, '*');
          }
          
          // 执行用户代码
          try {
            ${safeJS}
          } catch (runtimeError) {
            window.parent.postMessage({
              type: 'runtime-error',
              message: 'Runtime Error: ' + runtimeError.message,
              error: runtimeError.stack,
              timestamp: Date.now()
            }, '*');
          }
        <\/script>
      </body>
    </html>
  `;

    // 使用分块注入函数
    await streamInject(previewFrame.value, fullContent);
  } catch (error) {
    console.error('文档写入失败:', error);
    const fullContent = `
      <!DOCTYPE html>
      <html>
        <body>
          <h2>预览渲染错误</h2>
          <p>${SecurityService.sanitizeForDisplay(error.message)}</p>
        </body>
      </html>
    `;
    // 使用分块注入函数
    await streamInject(previewFrame.value, fullContent);
  }
}, 500);

// 分块与流式注入函数
const streamInject = (iframe: HTMLIFrameElement, htmlContent: string, chunkSize = 8192) => {
  return new Promise<void>((resolve) => {
    const doc = iframe.contentDocument;
    if (!doc) return resolve();

    doc.open();

    let i = 0;
    function writeChunk() {
      if (i < htmlContent.length) {
        const chunk = htmlContent.substring(i, i + chunkSize);
        doc.write(chunk);
        i += chunkSize;
        // 使用 requestAnimationFrame 来调度下一次写入，避免阻塞UI
        requestAnimationFrame(writeChunk);
      } else {
        doc.close();
        resolve();
      }
    }
    writeChunk();
  });
};

watch(status, () => {
  view.value.className = '';
  view.value.classList.add(status.value);
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

// 处理运行时错误
const handleRuntimeError = (errorData: { line: number; message: string }) => {
  console.log('Runtime error:', errorData);
};

// 处理跳转到指定行
const handleGotoLine = (line: number) => {
  console.log('Goto line:', line);
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
            name: SecurityService.sanitizeForSQL(file.name),
            path: SecurityService.sanitizeForSQL(file.path),
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
const handleGlobalShortcut = async (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    try {
      // 先格式化当前标签页的代码
      await codeStore.formatCurrentCode();
      // 再保存到Redis
      await codeStore.saveCode(userStore.account);
    } catch (error) {
      console.error('保存失败:', error);
    }
  }
};
onMounted(async () => {
  debouncedUpdatePreview(); // 初始加载时调用防抖版本
  window.addEventListener('keydown', handleGlobalShortcut);
  window.addEventListener('beforeunload', handleBeforeUnload);
  // 仅在调整大小时禁用 iframe 事件
  const iframe = document.querySelector('.preview-frame') as HTMLIFrameElement;
  iframe?.addEventListener('mouseover', () => {
    if (isResizing.value) {
      document.body.style.cursor = 'col-resize';
    }
  });
  checkLoginStatus();
  await checkShareAccess();
  console.log(userStore.isReadOnlyMode);
  debouncedUpdatePreview();
});

const checkLoginStatus = async () => {
  try {
    const response = await api.refreshToken();
    if (response.code === 200) {
      const { user } = response.data;
      userStore.login(user.username, user.account, user.avatar, user.status, user.createAt);
      codeStore.initProject();

      // 登录成功后，重新检查分享权限
      const shareResult = await ShareService.checkShareAccess();
      if (shareResult.success) {
        ShareService.applyShareAccess(shareResult);
      }
    } else {
      userStore.isLoggedIn = false;
    }
  } catch (error) {
    console.error('登录状态检查失败:', error);
    userStore.isLoggedIn = false;
  }
};

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
  window.removeEventListener('keydown', handleGlobalShortcut);
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
body,
.cm-content,
.cm-line {
  font-family: 'Consolas', 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}
.editor {
  font-family: inherit;
}
</style>
