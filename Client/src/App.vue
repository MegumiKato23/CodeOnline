<template>
  <div class="app">
    <Navbar @login="showLoginDialog = true" @openSettings="showSettings = true" />
    <div class="left" ref="view">
      <div class="main-content">
        <div class="editor-panel" ref="editorPanel">
          <CodeEditor
            ref="codeEditorRef"
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, isReadonly, nextTick } from 'vue';
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
const codeEditorRef = ref<any>(null);
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
    SecurityService.showSecurityAlert('xss', '检测到潜在的跨站脚本(XSS)攻击，已阻止代码执行');
    return;
  }

  // 使用不同的净化方法
  let safeHTML = SecurityService.sanitizeForWrite(htmlCode.value);
  let safeJS = jsCode.value;
  
  
  let safeCSS = cssCode.value; // CSS不需要特殊处理
  const detectFramework = () => {
    const js = safeJS.toLowerCase();
    const html = safeHTML.toLowerCase();
    
    return {
      isVue: js.includes('createapp') || js.includes('vue.createapp') || 
             html.includes('v-bind') || html.includes('v-on') || html.includes('v-model'),
      isReact: js.includes('react.createelement') || js.includes('reactdom.render') ||
               /<[A-Z][^>]*>/.test(safeJS) || js.includes('jsx')
    };
  };

  const { isVue, isReact } = detectFramework();

  // 构建框架脚本
  let frameworkScripts = '';
  if (isVue) {
    frameworkScripts += `
      <script src="https://cdn.jsdelivr.net/npm/vue@3.2.47/dist/vue.global.min.js"><\/script>
      <script>
        // Vue加载状态检测
        window.__vueLoaded = new Promise(resolve => {
          if (typeof Vue !== 'undefined') {
            console.log('Vue已加载');
            resolve();
          } else {
            const checkInterval = setInterval(() => {
              if (typeof Vue !== 'undefined') {
                clearInterval(checkInterval);
                console.log('Vue延迟加载完成');
                resolve();
              }
            }, 100);
            
            // 5秒超时处理
            setTimeout(() => {
              if (typeof Vue === 'undefined') {
                clearInterval(checkInterval);
                console.error('Vue加载超时');
                window.parent.postMessage({
                  type: 'framework-error',
                  message: 'Vue加载超时',
                  timestamp: Date.now()
                }, '*');
              }
            }, 5000);
          }
        });
      <\/script>
    `;
  }
  
  if (isReact) {
    frameworkScripts += `
      <script src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.development.js"><\/script>
      <script src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.development.js"><\/script>
      <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.21.4/babel.min.js"><\/script>
    `;
  }

  // 构建挂载点
  let mountPoints = '';
  if (isVue && !safeHTML.includes('id="app"')) {
    mountPoints += '<div id="app"></div>\n';
  }
  if (isReact && !safeHTML.includes('id="root"')) {
    mountPoints += '<div id="root"></div>\n';
  }
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
    const fullContent = `
    <!DOCTYPE html>
    <html>
      <head>
      <meta http-equiv="Content-Security-Policy" content="
        default-src 'none';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' *;
        style-src 'self' 'unsafe-inline';
      ">
      ${frameworkScripts}
        <style>${safeCSS}</style>
      </head>
      <body>
       ${safeHTML}
       ${mountPoints}
        <script>
          // 初始化console重写
          (function() {
            if (typeof window._internalOriginalConsole === 'undefined') {
              window._internalOriginalConsole = window.console;
              
              function getCallerInfo() {
                try {
                  const stack = new Error().stack;
                  if (stack) {
                    const stackLines = stack.split('\\n');
                    for (let i = 3; i < stackLines.length; i++) {
                      const line = stackLines[i];
                      if (line.includes('user-code.js')) {
                        const match = line.match(/:(\d+):(\d+)/);
                        if (match) {
                          let lineNum = parseInt(match[1]);
                          const colNum = parseInt(match[2]);
                          const actualLine = lineNum > 1 ? lineNum - 1 : 1;
                          return { line: actualLine, column: colNum };
                        }
                      }
                    }
                  }
                } catch (e) {
                  console.error('解析调用栈错误:', e);
                }
                return { line: null, column: null };
              }
              
              function sendConsoleMessage(level, args) {
                const callerInfo = getCallerInfo();
                window.parent.postMessage({
                  type: 'console-log',
                  level: level,
                  args: args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                  ),
                  line: callerInfo.line,
                  column: callerInfo.column,
                  timestamp: Date.now()
                }, '*');
              }
              
              // 确保所有console方法都存在
              const consoleMethods = ['log', 'info', 'warn', 'error', 'debug'];
              consoleMethods.forEach(method => {
                if (typeof console[method] !== 'function') {
                  console[method] = function() {};
                }
              });
              
              window.console = {
                log: function(...args) {
                  sendConsoleMessage('log', args);
                  window._internalOriginalConsole.log(...args);
                },
                info: function(...args) {
                  sendConsoleMessage('info', args);
                  window._internalOriginalConsole.info(...args);
                },
                warn: function(...args) {
                  sendConsoleMessage('warn', args);
                  window._internalOriginalConsole.warn(...args);
                },
                error: function(...args) {
                  sendConsoleMessage('error', args);
                  window._internalOriginalConsole.error(...args);
                },
                debug: function(...args) {
                  sendConsoleMessage('debug', args);
                  window._internalOriginalConsole.debug(...args);
                }
              };
              
              // 错误处理
              window.onerror = function(message, source, lineno, colno, error) {
                if (source === 'user-code.js') {
                  const actualLine = lineno > 1 ? lineno - 1 : 1;
                  const errorType = source.includes('.js') ? 'js' : 
                        source.includes('.html') ? 'html' : 'css';
                  window.parent.postMessage({
                    type: 'runtime-error',
                    message: message,
                    line: actualLine,
                    column: colno,
                    errorType: errorType
                  }, '*');
                }
                return true;
              };
              
              window.addEventListener('unhandledrejection', function(event) {
                window.parent.postMessage({
                  type: 'runtime-error',
                  message: 'Uncaught (in promise) ' + event.reason,
                  error: event.reason && event.reason.stack ? event.reason.stack : '',
                  timestamp: Date.now()
                }, '*');
              });
              
              window.addEventListener('securitypolicyviolation', function(event) {
                window.parent.postMessage({
                  type: 'runtime-error',
                  message: 'Content Security Policy violation: ' + 
                    event.violatedDirective + ' - ' + event.blockedURI,
                  error: event.originalPolicy,
                  timestamp: Date.now()
                }, '*');
              });
              
              window.addEventListener('error', function(event) {
                if (event.target !== window) {
                  window.parent.postMessage({
                    type: 'runtime-error',
                    message: 'Resource loading error: ' + 
                      (event.target.src || event.target.href || 'unknown resource'),
                    error: event.message || 'Failed to load resource',
                    timestamp: Date.now()
                  }, '*');
                }
              }, true);
            }
          })();
          
          // 监听iframe内部的点击事件
          document.addEventListener('click', function(e) {
            window.parent.postMessage({
              type: 'iframe-click',
              target: e.target.tagName,
              timestamp: Date.now()
            }, '*');
          });
          
          // 监听来自父页面的命令执行请求
          window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'execute-command') {
              try {
                const result = eval(event.data.command);
                window.parent.postMessage({
                  type: 'console-log',
                  level: 'log',
                  args: [result !== undefined ? String(result) : 'undefined'],
                  timestamp: Date.now()
                }, '*');
              } catch (error) {
                window.parent.postMessage({
                  type: 'console-log',
                  level: 'error',
                  args: [error.message],
                  timestamp: Date.now()
                }, '*');
              }
            }
          });
        <\/script>
      </body>
    </html>
  `;
    let userJSCode = '';
  if (isReact) {
    userJSCode = `
      // React代码需要Babel转译
      if (typeof Babel !== 'undefined') {
        try {
          const transpiledCode = Babel.transform(\`${safeJS.replace(/`/g, '\\`')}\`, {
            presets: ['react']
          }).code;
          eval(transpiledCode);
        } catch (e) {
          console.error('Babel转译错误:', e);
        }
      } else {
        console.error('Babel未加载，无法转译React代码');
      }
    `;
  } else if (isVue) {
    userJSCode = `
      // Vue代码执行
      (async function() {
        try {
          await window.__vueLoaded;
          
          if (typeof Vue === 'undefined') {
            throw new Error('Vue未加载');
          }
          
          const app = Vue.createApp({
            template: \`${safeHTML.replace(/`/g, '\\`')}\`,
            setup() {
              ${safeJS}
            }
          });
          app.mount('#app');
        } catch (error) {
          console.error('Vue初始化错误:', error);
          window.parent.postMessage({
            type: 'runtime-error',
            message: error.message,
            error: error.stack,
            timestamp: Date.now()
          }, '*');
        }
      })();
    `;
  } else {
    userJSCode = safeJS;
  }

    // 执行用户代码
  const userCodeExecution = `
    <script>
      try {
        ${userJSCode}
      } catch (error) {
        console.error('用户代码执行错误:', error);
      }
    <\/script>
  `;
    doc.open();
    doc.write(fullContent);
    doc.write(userCodeExecution);
    doc.close();
  } catch (error) {
    console.error('预览渲染失败:', error);
    const errorContent = `
      <!DOCTYPE html>
      <html>
        <body>
          <h2>预览渲染错误</h2>
          <p>${SecurityService.sanitizeForDisplay(error.message)}</p>
        </body>
      </html>
    `;
    previewFrame.value.srcdoc = errorContent;
  }
}, 500);

// 按标签层级分块渲染函数
const streamInject = (iframe: HTMLIFrameElement, htmlContent: string, jsContent: string, chunkSize = 8192) => {
  return new Promise<void>((resolve) => {
    const doc = iframe.contentDocument;
    if (!doc) return resolve();

    doc.open();

    // 解析HTML内容，分离head和body
    const htmlMatch = htmlContent.match(/<html[^>]*>([\s\S]*)<\/html>/i);
    if (!htmlMatch) {
      // 如果不是完整HTML，使用原来的分块方式
      return chunkRender(doc, htmlContent, chunkSize, resolve, true);
    }

    const headMatch = htmlMatch[1].match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const bodyMatch = htmlMatch[1].match(/<body[^>]*>([\s\S]*?)<\/body>/i);

    if (!bodyMatch) {
      return chunkRender(doc, htmlContent, chunkSize, resolve, true);
    }

    // 先写入HTML开始标签和head部分
    const htmlStart = htmlContent.substring(0, htmlContent.indexOf('<body'));
    const bodyStart = htmlContent.substring(htmlContent.indexOf('<body'), htmlContent.indexOf('>') + 1);
    const bodyEnd = '</body></html>';

    doc.write(htmlStart + bodyStart);

    // 解析body内容，按一级标签分组
    const bodyContent = bodyMatch[1];
    const topLevelElements = parseTopLevelElements(bodyContent);

    let currentIndex = 0;

    function renderNextElement() {
      if (currentIndex >= topLevelElements.length) {
        // 在所有元素渲染完成后，在body结束标签前执行用户代码
        doc.write(`
          <script>
            try {
                  // 移除之前添加的用户脚本
                  const existingScripts = document.querySelectorAll('script[data-user-script]');
                  existingScripts.forEach(script => script.remove());
      
                  // 创建独立的script标签执行用户代码
                  const userScript = document.createElement('script');
                  // 标记为用户脚本
                  userScript.setAttribute('data-user-script', 'true');
                  // 添加sourceURL以便调试
                  userScript.textContent = \`(function() {
                          ${jsContent}
                  })();//# sourceURL=user-code.js\`;
              
                      // 捕获语法错误
                  userScript.onerror = function(error) {
                      window.parent.postMessage({
                          type: 'syntax-error',
                          message: 'SyntaxError: ' + error.message,
                          timestamp: Date.now(),
                          isSyntaxError: true
                        }, '*');
                    };
                  document.body.appendChild(userScript);
                } catch (error) {
                      // 处理其他错误
                    window.parent.postMessage({
                        type: 'runtime-error',
                        message: error.message,
                        error: error.stack,
                        timestamp: Date.now()
                      }, '*');
                  }
          <\/script>
        `);
        doc.write(bodyEnd);
        doc.close();
        resolve();
        return;
      }

      const element = topLevelElements[currentIndex];
      currentIndex++;

      // 添加渲染节流，避免过度占用主线程
      const shouldThrottle = element.length > chunkSize * 2;

      const delay = shouldThrottle ? 16 : 0; // 60fps vs immediate

      // 如果元素内容超过8KB，进行分块渲染
      if (element.length > chunkSize) {
        chunkRender(
          doc,
          element,
          chunkSize,
          () => {
            setTimeout(renderNextElement, delay);
          },
          false
        );
      } else {
        doc.write(element);
        setTimeout(renderNextElement, delay);
      }
    }

    renderNextElement();
  });
};

// 解析body下的一级标签
function parseTopLevelElements(bodyContent: string): string[] {
  const elements: string[] = [];
  let depth = 0;
  let elementStart = 0;

  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  const commentRegex = /<!--[\s\S]*?-->/g;

  // 先移除注释
  bodyContent = bodyContent.replace(commentRegex, '');
  let match;

  while ((match = tagRegex.exec(bodyContent)) !== null) {
    const tag = match[0];
    const tagName = match[1];
    const isClosingTag = tag.startsWith('</');
    const isSelfClosing =
      tag.endsWith('/>') || ['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagName.toLowerCase());

    if (!isClosingTag && !isSelfClosing) {
      if (depth === 0) {
        // 如果之前有内容，先保存
        if (match.index > elementStart) {
          const textContent = bodyContent.substring(elementStart, match.index).trim();
          if (textContent) {
            elements.push(textContent);
          }
        }
        elementStart = match.index;
      }
      depth++;
    } else if (isClosingTag) {
      depth--;
      if (depth === 0) {
        // 一级标签结束，保存整个元素
        const element = bodyContent.substring(elementStart, tagRegex.lastIndex);
        elements.push(element);
        elementStart = tagRegex.lastIndex;
      }
    }
  }

  // 处理剩余内容
  if (elementStart < bodyContent.length) {
    const remaining = bodyContent.substring(elementStart).trim();
    if (remaining) {
      elements.push(remaining);
    }
  }

  return elements;
}

// 通用分块渲染函数
function chunkRender(
  doc: Document,
  content: string,
  chunkSize: number,
  callback: () => void,
  shouldCloseDoc: boolean = false
) {
  let i = 0;

  function writeChunk() {
    if (i < content.length) {
      const chunk = content.substring(i, i + chunkSize);
      doc.write(chunk);
      i += chunkSize;
      requestAnimationFrame(writeChunk);
    } else {
      if (shouldCloseDoc) {
        doc.close();
      }
      callback();
    }
  }
  writeChunk();
}

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
const handleGotoLine = async (data: { line: number; type?: string }) => {
  console.log('跳转到行:', data);

  // 确保行号有效
  if (typeof data.line !== 'number' || isNaN(data.line) || data.line < 1) {
    console.error('[App] 无效的行号:', data.line);
    return;
  }

  // 确保类型是有效的标签值
  const validTypes = ['html', 'css', 'js'] as const;
  const tabType = validTypes.includes(data.type as any) ? (data.type as 'html' | 'css' | 'js') : 'js';

  codeStore.setActiveTab(tabType);

  // 等待下一个tick确保编辑器已切换
  await nextTick();

  if (codeEditorRef.value?.gotoLine) {
    try {
      await codeEditorRef.value.gotoLine(data.line, tabType);
      return true;
    } catch (error) {
      console.error('跳转失败:', error);
      return false;
    }
  }

  return false;
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
    // 检查是否已登录
    if (!userStore.isLoggedIn) {
      showLoginDialog.value = true;
      return;
    }
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
  // debouncedUpdatePreview(); // 初始加载时调用防抖版本
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

/* 性能测试弹窗样式
.performance-test-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
} */

.modal-content {
  background: #2a2a2a;
  border-radius: 8px;
  width: 90%;
  max-width: 1200px;
  max-height: 90%;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #444;
}

.modal-header h2 {
  color: white;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.close-btn:hover {
  background: #444;
}
.security-alert {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transform: translateX(120%);
  animation: slideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  /* 移除 border-left 属性 */
}
.alert-xss .alert-title {
  color: #ff6b6b;
}

.alert-sql .alert-title {
  color: #f06595;
}

/* 头部背景色调整 */
.alert-xss .alert-header {
  background-color: rgba(255, 107, 107, 0.05);
  border-bottom: 1px solid rgba(255, 107, 107, 0.1);
}

.alert-sql .alert-header {
  background-color: rgba(240, 101, 149, 0.05);
  border-bottom: 1px solid rgba(240, 101, 149, 0.1);
}

/* 其余样式保持不变 */
.alert-header {
  display: flex;
  align-items: center;
  padding: 16px;
}

.alert-icon {
  font-size: 20px;
  margin-right: 12px;
}

.alert-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  flex-grow: 1;
}
.close-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  opacity: 1;
}

.close-btn svg {
  display: block;
}

.alert-body {
  padding: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #555;
}

.alert-progress {
  height: 3px;
  background: rgba(0, 0, 0, 0.05);
  width: 100%;
}

.alert-progress::after {
  content: '';
  display: block;
  height: 100%;
  width: 100%;
}

.alert-xss .alert-progress::after {
  background: linear-gradient(90deg, #ff6b6b, #ff8787);
}

.alert-sql .alert-progress::after {
  background: linear-gradient(90deg, #f06595, #f783ac);
}

.fade-out {
  animation: fadeOut 0.3s ease forwards !important;
}
@keyframes slideIn {
  to {
    transform: translateX(0);
  }
}

@keyframes fadeOut {
  to {
    opacity: 0;
    transform: translateX(120%);
  }
}

@keyframes progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
</style>