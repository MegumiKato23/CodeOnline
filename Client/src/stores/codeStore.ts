import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api, CreateFileRequest, FileType } from '@/api';
import { formatCode } from '@/utils/formatter';
import { useUserStore } from './userStore';

export const useCodeStore = defineStore('code', () => {
  const htmlCode = ref('');
  const cssCode = ref('');
  const jsCode = ref('');
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
    const currentCode = tab === 'html' ? htmlCode.value : tab === 'css' ? cssCode.value : jsCode.value;

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

  const initProject = () => {
    api.getUserProjects().then(async (res) => {
      console.log(res);
      const { data: userProjectData } = res;
      if (userProjectData['projects'].length == 0) {
        const { data } = await api.createProject({ name: 'New Project' });
        const projectData = data.project; // Assuming the first project is the new one created by the registratio
        console.log(projectData);
        await initProjectFiles(projectData.id);
        useUserStore().currentProjectId = projectData.id;
      } else {
        useUserStore().currentProjectId = userProjectData['projects'][0]['id'];
        try {
          const { data } = await api.getProject(useUserStore().currentProjectId);
          // console.log(projectRes);
          const files = data.project['files'];
          // 创建文件类型映射
          const typeMapping = {
            HTML: 'html',
            CSS: 'css',
            JS: 'js',
          };
          // 处理每个文件
          files.forEach((file) => {
            const mappedType = typeMapping[file.type];
            if (mappedType) {
              updateCode(mappedType, file.content);
            }
          });
          console.log('项目文件加载完成');
        } catch (error) {
          console.error('加载项目文件失败:', error);
        }
      }
    });
  };

  //初始化项目文件
  const initProjectFiles = async (projectId: string): Promise<void> => {
    try {
      const files: CreateFileRequest[] = [
        {
          name: 'index.html',
          path: '/index.html',
          content: '',
          type: FileType.HTML,
        },
        {
          name: 'styles.css',
          path: '/styles.css',
          content: '',
          type: FileType.CSS,
        },
        {
          name: 'script.js',
          path: '/script.js',
          content: '',
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

  const saveProject = async () => {
    try {
      const { data } = await api.getProject(useUserStore().currentProjectId);
      const projectData = data.project;
      projectData.files.map(async (file: any) => {
        let content = '';
        switch (file.type) {
          case FileType.HTML:
            content = htmlCode.value;
            break;
          case FileType.CSS:
            content = cssCode.value;
            break;
          case FileType.JS:
            content = jsCode.value;
            break;
        }
        await api.updateFile(useUserStore().currentProjectId, file.id, {
          name: file.name,
          path: file.path,
          content: content,
          type: file.type,
        });
      });
    } catch (error) {
      console.error('保存失败:', error);
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
    initProject,
    initProjectFiles,
    loadProjectFromShare,
    saveProject,
    promptFormat,
    cancelFormat,
    formatCurrentCode,
  };
});
