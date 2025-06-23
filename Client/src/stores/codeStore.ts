import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/api';

export const useCodeStore = defineStore('code', () => {
  const htmlCode = ref(
    '<div class="root">\n  <div>\n    <svg viewBox="0 0 100 100" fill="white" width="60px" height="60px">\n      <circle cx="50" cy="50" r="40" />\n    </svg>\n    <h1>CodePen Clone</h1>\n    <p>CodePen is a clone of a famous web IDE developed by Diwanshu Midha</p>\n  </div>\n</div>'
  );
  const cssCode = ref(
    '.root {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 80vh;\n  background: #1a1a1a;\n  color: white;\n  text-align: center;\n}'
  );
  const jsCode = ref('console.log("Hello from CodePen Clone")');
  const activeTab = ref<'html' | 'css' | 'js'>('html');
  const saved = ref(true);
  const updateCode = (type: 'html' | 'css' | 'js', code: string) => {
    if (type === 'html') htmlCode.value = code;
    else if (type === 'css') cssCode.value = code;
    else if (type === 'js') jsCode.value = code;
    saved.value = false;
  };

  const saveCode = async (userId: string) => {
    try {
      await api.saveCode({
        userId,
        html: htmlCode.value,
        css: cssCode.value,
        js: jsCode.value
      });
      console.log('代码已保存到Redis');
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  // 新增的loadCode方法
  const loadCode = async (userId: string) => {
  try {
    const response = await api.getCode(userId);
    htmlCode.value = response.data.html || htmlCode.value;
    cssCode.value = response.data.css || cssCode.value;
    jsCode.value = response.data.js || jsCode.value;
  } catch (error) {
    console.error('加载失败:', error);
    }
  };

  const setActiveTab = (tab: 'html' | 'css' | 'js') => {
    activeTab.value = tab;
  };

  return {
    htmlCode,
    cssCode,
    jsCode,
    activeTab,
    saved,
    updateCode,
    saveCode,
    setActiveTab,
    loadCode 
  };
});