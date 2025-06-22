<template>
  <div class="register-overlay" v-if="visible" @click.self="close">
    <div class="register-dialog">
      <div class="register-header">
        <h2>注册 CodeOnline 账号</h2>
        <button class="close-btn" @click="close">×</button>
      </div>
      <div class="register-body">
        <div class="form-group">
<<<<<<< HEAD
          <label for="username"> 用户名</label>
          <input type="text" id="username" v-model="registerForm.username" placeholder="请输入用户名" />
          <div class="input-tip">用户名长度3-20个字符</div>
=======
          <label for="username">用户名</label>
          <input type="text" id="username" v-model="registerForm.username" placeholder="请输入用户名" />
>>>>>>> bfca8a1 (解决冲突)
        </div>
        <div class="form-group">
          <label for="account">手机号</label>
          <input type="text" id="account" v-model="registerForm.account" placeholder="请输入手机号" />
<<<<<<< HEAD
          <div class="input-tip">请输入11位手机号码</div>
=======
>>>>>>> bfca8a1 (解决冲突)
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="registerForm.password" placeholder="请输入密码" />
<<<<<<< HEAD
          <div class="input-tip">密码长度6-30个字符，必须包含大小写字母和数字</div>
=======
>>>>>>> bfca8a1 (解决冲突)
        </div>
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="registerForm.confirmPassword"
            placeholder="请再次输入密码"
          />
<<<<<<< HEAD
          <div class="input-tip">请再次输入相同的密码</div>
=======
>>>>>>> bfca8a1 (解决冲突)
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
<<<<<<< HEAD
import { api } from '@/api';
=======
>>>>>>> bfca8a1 (解决冲突)

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

const handleRegister = async () => {
  // 验证表单
  if (!registerForm.username.trim()) {
    errorMessage.value = '请输入用户名';
    return;
<<<<<<< HEAD
  }
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]{3,20}$/.test(registerForm.username.trim())) {
    errorMessage.value = '用户名格式不正确，长度3-20个字符，只能包含字母、数字、下划线和中文';
    return;
=======
>>>>>>> bfca8a1 (解决冲突)
  }
  if (!registerForm.account.trim()) {
    errorMessage.value = '请输入手机号';
    return;
<<<<<<< HEAD
  }
  if (!/^1\d{10}$/.test(registerForm.account.trim())) {
    errorMessage.value = '请输入正确的手机号码';
    return;
=======
>>>>>>> bfca8a1 (解决冲突)
  }
  if (!registerForm.password.trim()) {
    errorMessage.value = '请输入密码';
    return;
<<<<<<< HEAD
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,30}$/.test(registerForm.password)) {
    errorMessage.value = '密码格式不正确，长度6-30个字符，必须包含大小写字母和数字';
    return;
=======
>>>>>>> bfca8a1 (解决冲突)
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致';
    return;
  }

<<<<<<< HEAD
  try {
    const response = await api.register({
      username: registerForm.username,
      account: registerForm.account,
      password: registerForm.password,
      confirmPassword: registerForm.confirmPassword,
    });

    // 注册成功后切换到登录界面
    if (response.code === 200) {
      resetForm();
      switchToLogin();
    } else if (response.code === 1001) {
      resetForm();
      errorMessage.value = '账号已存在';
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '注册失败';
  }
=======
  // TODO: 调用注册接口
  console.log('注册信息:', registerForm);

  // 注册成功后切换到登录界面
  switchToLogin();
>>>>>>> bfca8a1 (解决冲突)
};

const switchToLogin = () => {
  emit('login');
};
<<<<<<< HEAD

const resetForm = () => {
  registerForm.username = '';
  registerForm.account = '';
  registerForm.password = '';
  registerForm.confirmPassword = '';
  errorMessage.value = '';
};
=======
>>>>>>> bfca8a1 (解决冲突)
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

.input-tip {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
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
