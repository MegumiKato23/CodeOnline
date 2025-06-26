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
    const { user } = await api.login({
      account: loginForm.account,
      password: loginForm.password,
    });

    // 更新用户信息
    userStore.setUsername(user.username);
    userStore.setAccount(user.account);
    userStore.setAvatar(user.avatar);
    userStore.setStatus(user.status);
    userStore.login();

    api.getUserProjects().then(async (res) => {
      if (res['projects'].length == 0) {
        const { project: projectData } = await api.createProject({ name: 'New Project' });
        console.log(projectData);
        await codeStore.initProjectFiles(projectData.id);
        userStore.currentProjectId = projectData.id;
      } else {
        userStore.currentProjectId = res['projects'][0]['id'];
        try {
          const projectRes = await api.getProject(userStore.currentProjectId);
          // console.log(projectRes);
          const files = projectRes['files'];

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
              codeStore.updateCode(mappedType, file.content);
            }
          });

          console.log('项目文件加载完成');
        } catch (error) {
          console.error('加载项目文件失败:', error);
        }
      }
    });

    // 登录成功后，重新检查分享权限
    const shareResult = await ShareService.checkShareAccess();
    if (shareResult.success) {
      ShareService.applyShareAccess(shareResult);
    }

    // 关闭登录框
    close();
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '登录失败';
  }
};

const switchToRegister = () => {
  emit('register');
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
</style>
