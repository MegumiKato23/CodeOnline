<template>
  <div class="register-overlay" v-if="visible" @click.self="close">
    <div class="register-dialog">
      <div class="register-header">
        <h2>注册 CodeOnline 账号</h2>
        <button class="close-btn" @click="close">×</button>
      </div>
      <div class="register-body">
        <div class="form-group">
          <label for="username">用户名</label>
          <input type="text" id="username" v-model="registerForm.username" placeholder="请输入用户名" />
        </div>
        <div class="form-group">
          <label for="account">手机号</label>
          <input type="text" id="account" v-model="registerForm.account" placeholder="请输入手机号" />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="registerForm.password" placeholder="请输入密码" />
        </div>
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="registerForm.confirmPassword"
            placeholder="请再次输入密码"
          />
        </div>
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      </div>
      <div class="register-footer">
        <button class="btn login-btn" @click="switchToLogin">返回登录</button>
        <button class="btn register-submit-btn" @click="handleRegister">注册</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(['close', 'login']);

const errorMessage = ref('');

const registerForm = reactive({
  username: '',
  account: '',
  password: '',
  confirmPassword: '',
});

const close = () => {
  emit('close');
  // 清空表单和错误信息
  registerForm.username = '';
  registerForm.account = '';
  registerForm.password = '';
  registerForm.confirmPassword = '';
  errorMessage.value = '';
};

const handleRegister = () => {
  // 验证表单
  if (!registerForm.username.trim()) {
    errorMessage.value = '请输入用户名';
    return;
  }
  if (!registerForm.account.trim()) {
    errorMessage.value = '请输入手机号';
    return;
  }
  if (!registerForm.password.trim()) {
    errorMessage.value = '请输入密码';
    return;
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致';
    return;
  }

  // TODO: 调用注册接口
  console.log('注册信息:', registerForm);

  // 注册成功后切换到登录界面
  switchToLogin();
};

const switchToLogin = () => {
  emit('login');
};
</script>

<style scoped>
.register-overlay {
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

.register-dialog {
  background-color: #2a2a2a;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.register-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #3a3a3a;
}

.register-header h2 {
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

.register-body {
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

.register-footer {
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

.login-btn {
  background-color: transparent;
  color: #ccc;
  border: 1px solid #555;
}

.register-submit-btn {
  background-color: #4a9eff;
  color: white;
}

.register-submit-btn:hover {
  background-color: #3a8eef;
}
</style>
