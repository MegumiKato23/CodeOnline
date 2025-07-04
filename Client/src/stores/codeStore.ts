import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api, CreateFileRequest, FileType } from '@/api';
import { formatCode} from '@/utils/formatter';
export const useCodeStore = defineStore('code', () => {
  const htmlCode = ref('<h1>Hello World</h1>');
  const cssCode = ref('body { font-family: Arial, sans-serif; color: #333; }');
  const jsCode = ref('console.log("Hello from CodePen Clone")');
  const activeTab = ref<'html' | 'css' | 'js'>('html');
  const saved = ref(true);
  const showFormatPrompt = ref(false);
  const formatTab = ref<'html' | 'css' | 'js' | null>(null);
  const updateCode = (type: 'html' | 'css' | 'js', code: string) => {
    if (type === 'html') htmlCode.value = code;
    else if (type === 'css') cssCode.value = code;
    else if (type === 'js') jsCode.value = code;
    saved.value = false;
  };
  const promptFormat = (tab: 'html' | 'css' | 'js') => {
    showFormatPrompt.value = true;
    formatTab.value = tab;
  };

  const cancelFormat = () => {
    showFormatPrompt.value = false;
    formatTab.value = null;
  };

  const formatCurrentCode = async () => {
    const tab = activeTab.value;
    const currentCode = tab === 'html' ? htmlCode.value :
                      tab === 'css' ? cssCode.value :
                      jsCode.value;
    
    const formatted = await formatCode(currentCode, tab);
    updateCode(tab, formatted);
  };
  const saveCode = async (userId: string) => {
    try {
      await api.saveCode({
        userId,
        files: [
          {
            name: 'index.html',
            path: 'New project/',
            content: htmlCode.value, // 确保使用最新值
            type: FileType.HTML,
          },
          {
            name: 'styles.css',
            path: 'New project/',
            content: cssCode.value, // 确保使用最新值
            type: FileType.CSS,
          },
          {
            name: 'script.js',
            path: 'New project/',
            content: jsCode.value, // 确保使用最新值
            type: FileType.JS,
          },
        ],
      });
      saved.value = true;
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const setActiveTab = (tab: 'html' | 'css' | 'js') => {
    activeTab.value = tab;
  };

  //初始化项目文件
  const initProjectFiles = async (projectId: string): Promise<void> => {
    try {
      const files: CreateFileRequest[] = [
        {
          name: 'index.html',
          path: '/index.html',
          content: htmlCode.value,
          type: FileType.HTML,
        },
        {
          name: 'styles.css',
          path: '/styles.css',
          content: cssCode.value,
          type: FileType.CSS,
        },
        {
          name: 'script.js',
          path: '/script.js',
          content: jsCode.value,
          type: FileType.JS,
        },
      ];
      const createPromises = files.map((file) => api.createFile(projectId, file));
      await Promise.all(createPromises);
      console.log('项目文件初始化成功');
    } catch (error) {
      console.error('初始化项目文件失败:', error);
      throw error;
    }
  };

  // 加载分享项目数据
  const loadProjectFromShare = (projectData: any) => {
    try {
      // 验证数据格式
      if (!projectData || !projectData.files || !Array.isArray(projectData.files)) {
        throw new Error('无效的项目数据格式');
      }

      // 重置代码内容
      htmlCode.value = '';
      cssCode.value = '';
      jsCode.value = '';

      // 根据文件类型加载内容，优化性能
      const fileMap = new Map();
      console.log(projectData.files);
      projectData.files.forEach((file: any) => {
        if (file && file.type && file.content !== undefined) {
          fileMap.set(file.type.toUpperCase(), file.content);
        }
      });

      // 批量更新代码内容
      htmlCode.value = fileMap.get('HTML') || '';
      cssCode.value = fileMap.get('CSS') || '';
      jsCode.value = fileMap.get('JS') || fileMap.get('JAVASCRIPT') || '';

      // 设置为已保存状态（因为是从服务器加载的）
      saved.value = true;

      // 默认显示HTML标签页，如果没有HTML则显示第一个可用的标签页
      if (htmlCode.value) {
        activeTab.value = 'html';
      } else if (cssCode.value) {
        activeTab.value = 'css';
      } else if (jsCode.value) {
        activeTab.value = 'js';
      } else {
        activeTab.value = 'html'; // 默认
      }

      console.log(`分享项目加载成功: ${projectData.name || '未命名项目'}`);
    } catch (error) {
      console.error('加载分享项目失败:', error);
      // 发生错误时重置为默认状态
      htmlCode.value = '';
      cssCode.value = '';
      jsCode.value = '';
      activeTab.value = 'html';
      saved.value = true;
    }
  };

  return {
    htmlCode,
    cssCode,
    jsCode,
    activeTab,
    saved,
    showFormatPrompt,
    formatTab,
    updateCode,
    saveCode,
    setActiveTab,
    initProjectFiles,
    loadProjectFromShare,
    promptFormat,
    cancelFormat,
    formatCurrentCode,
  };
});
