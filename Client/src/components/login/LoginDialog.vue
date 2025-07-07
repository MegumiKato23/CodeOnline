<template>
  <div class="login-overlay" v-if="visible" @click.self="close">
    <div class="login-dialog">
      <div class="login-header">
        <h2>登录到 CodeOnline</h2>
        <button class="close-btn" @click="close">×</button>
      </div>
      <div class="login-body">
        <div class="form-group">
          <label for="account">账号</label>
          <input type="text" id="account" v-model="loginForm.account" placeholder="请输入账户" />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="loginForm.password" placeholder="请输入密码" />
        </div>
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      </div>
      <div class="login-footer">
        <button class="btn register-btn" @click="switchToRegister">注册账号</button>
        <button class="btn login-submit-btn" @click="handleLogin">登录</button>
      </div>
    </div>
  </div>
  <!-- 登录成功弹窗 -->
  <div v-if="showLoginToast" class="login-toast" :class="loginToastType">
    <div class="toast-content" :class="loginToastType">
      <span class="toast-icon">{{ loginToastType === 'success' ? '✓' : '' }}</span>
      <span class="toast-text">{{ loginToastMessage }}</span>
      <span class="toast-close" @click="showLoginToast = false">×</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { api } from '@/api';
import { Users } from 'lucide-vue-next';
import { useCodeStore } from '@/stores/codeStore';
import { ShareService } from '@/services/shareService';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(['close', 'register']);

const userStore = useUserStore();
const codeStore = useCodeStore();

const errorMessage = ref('');

const loginForm = reactive({
  account: '',
  password: '',
});

const showLoginToast = ref(false);
const loginToastType = ref('success'); // 'success' 或 'error'
const loginToastMessage = ref('');

const close = () => {
  emit('close');
  // 清空表单和错误信息
  loginForm.account = '';
  loginForm.password = '';
  errorMessage.value = '';
};

const handleLogin = async () => {
  // 验证表单
  if (!loginForm.account.trim()) {
    errorMessage.value = '请输入账号';
    return;
  }
  if (!loginForm.password.trim()) {
    errorMessage.value = '请输入密码';
    return;
  }

  try {
    const response = await api.login({
      account: loginForm.account,
      password: loginForm.password,
    });

    const { user } = response.data;

    // 更新用户信息
    userStore.login(user.username, user.account, user.avatar, user.status, user.createAt);

    if (codeStore.htmlCode || codeStore.cssCode || codeStore.jsCode) {
      const { data } = await api.createProject({ name: 'New Project' });
      const projectData = data.project;
      await codeStore.initProjectFiles(projectData.id);
      userStore.currentProjectId = projectData.id;
    } else {
      useCodeStore().initProject();
    }

    // 登录成功后，重新检查分享权限
    const shareResult = await ShareService.checkShareAccess();

    if (shareResult.success) {
      ShareService.applyShareAccess(shareResult);
    }

    loginToastType.value = 'success';
    loginToastMessage.value = `Successfully logged in`;
    showLoginToast.value = true;
    // 3秒后自动隐藏提示
    setTimeout(() => {
      showLoginToast.value = false;
    }, 3000);

    // 关闭登录框
    resetForm();
    close();
  } catch (error) {
    resetForm();
    errorMessage.value = error.response?.data?.message || '登录失败';
  }
};

const switchToRegister = () => {
  emit('register');
};

const resetForm = () => {
  loginForm.password = '';
  errorMessage.value = '';
};
</script>

<style scoped>
.login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.login-dialog {
  background-color: #2a2a2a;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #3a3a3a;
}

.login-header h2 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 24px;
  cursor: pointer;
}

.login-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #ccc;
}

input {
  width: 100%;
  padding: 10px;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #666;
}

.error-message {
  color: #ff6b6b;
  font-size: 14px;
  margin-top: 10px;
}

.login-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid #3a3a3a;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.register-btn {
  background-color: transparent;
  color: #ccc;
  border: 1px solid #555;
}

.login-submit-btn {
  background-color: #4a9eff;
  color: white;
}

.login-submit-btn:hover {
  background-color: #3a8eef;
}

/* 登录提示弹窗样式 */
.login-toast {
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
  border: 2px solid #45a049;
}

.login-toast.success .toast-icon {
  font-size: 16px;
  font-weight: bold;
  color: white;
}

/* 失败样式 */
.toast-content.error {
  background: #f44336;
  border: 2px solid #d32f2f;
}

.login-toast.error .toast-icon {
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
</style>
