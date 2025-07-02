<template>
  <div class="register-overlay" v-if="visible" @click.self="close">
    <div class="register-dialog">
      <div class="register-header">
        <h2>注册 CodeOnline 账号</h2>
        <button class="close-btn" @click="close">×</button>
      </div>
      <div class="register-body">
        <div class="form-group">
          <label for="username"> 用户名</label>
          <input
            type="text"
            id="username"
            v-model="registerForm.username"
            placeholder="请输入用户名"
            maxlength="20"
            @input="handleUsernameInputChange"
          />
          <div class="input-tip" :class="getTipClass(usernameTip)">
            {{ usernameTip || '用户名长度3-20个字符，支持字母、数字、下划线和中文' }}
          </div>
        </div>
        <div class="form-group">
          <label for="account">手机号</label>
          <input
            type="text"
            id="account"
            v-model="registerForm.account"
            placeholder="请输入手机号"
            maxlength="11"
            @input="handlePhoneInputChange"
            @blur="handlePhoneBlur"
          />
          <div class="input-tip" :class="getTipClass(phoneTip)">{{ phoneTip || '请输入11位手机号码' }}</div>
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="registerForm.password"
            placeholder="请输入密码"
            maxlength="30"
            @input="handlePasswordInputChange"
          />
          <div class="input-tip" :class="getTipClass(passwordTip)">
            {{ passwordTip || '密码长度6-30个字符，必须包含大小写字母和数字' }}
          </div>
          <div class="password-strength" v-if="registerForm.password.length > 0">
            <div class="strength-bar" :class="passwordStrength"></div>
            <span class="strength-text">{{ passwordStrengthText }}</span>
          </div>
        </div>
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="registerForm.confirmPassword"
            placeholder="请再次输入密码"
            @input="handleConfirmPasswordInputChange"
          />
          <div class="input-tip" :class="getTipClass(confirmPasswordTip)">
            {{ confirmPasswordTip || '请再次输入相同的密码' }}
          </div>
        </div>
        <div class="message" :class="isRegistered ? 'success' : ''" v-if="message">{{ message }}</div>
      </div>
      <div class="register-footer">
        <button class="btn login-btn" @click="switchToLogin">返回登录</button>
        <button class="btn register-submit-btn" @click="handleRegister">注册</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { api } from '@/api';

// 防抖函数
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(['close', 'login']);

// 提示信息
const usernameTip = ref('');
const phoneTip = ref('');
const passwordTip = ref('');
const confirmPasswordTip = ref('');

// 验证状态
const usernameValid = ref(false);
const phoneValid = ref(false);
const passwordValid = ref(false);
const confirmPasswordValid = ref(false);

const message = ref('');
const isRegistered = ref(false);

const registerForm = reactive({
  username: '',
  account: '',
  password: '',
  confirmPassword: '',
});

// 密码强度计算
const passwordStrength = computed(() => {
  const password = registerForm.password;
  if (password.length === 0) return '';

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
});

const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 'weak':
      return '弱';
    case 'medium':
      return '中等';
    case 'strong':
      return '强';
    default:
      return '';
  }
});

const getTipClass = (tipValue: string) => {
  if (!tipValue) return '';
  return 'error';
};

const close = () => {
  emit('close');
  // 清空表单和错误信息
  resetForm();
};

const handleRegister = async () => {
  // 清空之前的错误信息
  message.value = '';
  // 执行完整验证
  const usernameError = validateUsername(registerForm.username.trim());
  const phoneError = validatePhone(registerForm.account.trim());
  const passwordError = validatePassword(registerForm.password);
  const confirmPasswordError = validateConfirmPassword();

  // 更新提示信息
  usernameTip.value = usernameError;
  phoneTip.value = phoneError;
  passwordTip.value = passwordError;
  confirmPasswordTip.value = confirmPasswordError;

  // 检查基本字段是否为空
  if (!registerForm.username.trim()) {
    message.value = '请输入用户名';
    return;
  }
  if (!registerForm.account.trim()) {
    message.value = '请输入手机号';
    return;
  }
  if (!registerForm.password.trim()) {
    message.value = '请输入密码';
    return;
  }
  if (!registerForm.confirmPassword.trim()) {
    message.value = '请确认密码';
    return;
  }

  // 检查验证状态
  if (!usernameValid.value || !phoneValid.value || !passwordValid.value || !confirmPasswordValid.value) {
    message.value = '请修正表单中的错误后再提交';
    return;
  }

  try {
    const response = await api.register({
      username: registerForm.username.trim(),
      account: registerForm.account.trim(),
      password: registerForm.password,
      confirmPassword: registerForm.confirmPassword,
    });

    // 注册成功后切换到登录界面
    if (response.code === 200) {
      // 显示成功提示
      message.value = '注册成功！';
      isRegistered.value = true;
      setTimeout(() => {
        resetForm();
        switchToLogin();
      }, 1500);
    } else if (response.code === 1001) {
      message.value = '该手机号已被注册，请使用其他手机号';
    } else {
      message.value = response.message || '注册失败，请重试';
    }
  } catch (error: any) {
    console.error('注册错误:', error);
    if (error.response?.status === 409) {
      message.value = '该手机号已被注册，请使用其他手机号';
    } else if (error.response?.status === 400) {
      message.value = '请求参数错误，请检查输入信息';
    } else {
      message.value = error.response?.data?.message || '网络错误，请稍后重试';
    }
  }
};

const switchToLogin = () => {
  emit('login');
};

// 用户名验证
const validateUsername = (username: string) => {
  if (username.length === 0) {
    usernameValid.value = false;
    return '';
  }

  if (username.length < 3) {
    usernameValid.value = false;
    return '用户名长度至少需要3个字符';
  }

  if (username.length > 20) {
    usernameValid.value = false;
    return '用户名长度不能超过20个字符';
  }

  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
    usernameValid.value = false;
    return '用户名只能包含字母、数字、下划线和中文';
  }

  usernameValid.value = true;
  return '';
};

const handleUsernameInputChange = debounce(() => {
  const username = registerForm.username;
  if (username.length >= 3) {
    usernameTip.value = validateUsername(username);
  } else if (username.length > 0) {
    usernameTip.value = '用户名长度至少需要3个字符';
    usernameValid.value = false;
  } else {
    usernameTip.value = '';
    usernameValid.value = false;
  }
}, 300);

// 手机号验证
const validatePhone = (phone: string) => {
  if (phone.length === 0) {
    phoneValid.value = false;
    return '';
  }

  if (!/^1\d{10}$/.test(phone)) {
    phoneValid.value = false;
    return '请输入正确的11位手机号码';
  }

  phoneValid.value = true;
  return '';
};

const handlePhoneInputChange = debounce(() => {
  const phone = registerForm.account;
  if (phone.length >= 11) {
    phoneTip.value = validatePhone(phone);
  } else if (phone.length > 0) {
    phoneTip.value = '手机号长度需要11位';
    phoneValid.value = false;
  } else {
    phoneTip.value = '';
    phoneValid.value = false;
  }
}, 300);

const handlePhoneBlur = () => {
  if (registerForm.account) {
    phoneTip.value = validatePhone(registerForm.account);
  }
};

// 密码验证
const validatePassword = (password: string) => {
  if (password.length === 0) {
    passwordValid.value = false;
    return '';
  }

  if (password.length < 6) {
    passwordValid.value = false;
    return '密码长度至少需要6个字符';
  }

  if (password.length > 30) {
    passwordValid.value = false;
    return '密码长度不能超过30个字符';
  }

  if (!/[A-Z]/.test(password)) {
    passwordValid.value = false;
    return '密码必须包含至少一个大写字母';
  }

  if (!/[a-z]/.test(password)) {
    passwordValid.value = false;
    return '密码必须包含至少一个小写字母';
  }

  if (!/[0-9]/.test(password)) {
    passwordValid.value = false;
    return '密码必须包含至少一个数字';
  }

  passwordValid.value = true;
  return '';
};

const handlePasswordInputChange = debounce(() => {
  const password = registerForm.password;

  // 渐进式验证：先检查长度，再检查复杂度
  if (password.length > 0 && password.length < 6) {
    passwordTip.value = '密码长度至少需要6个字符';
    passwordValid.value = false;
  } else if (password.length >= 6) {
    passwordTip.value = validatePassword(password);
  } else {
    passwordTip.value = '';
    passwordValid.value = false;
  }

  // 同时验证确认密码
  if (registerForm.confirmPassword) {
    validateConfirmPassword();
  }
}, 300);

// 确认密码验证
const validateConfirmPassword = () => {
  const confirmPassword = registerForm.confirmPassword;
  const password = registerForm.password;

  if (confirmPassword.length === 0) {
    confirmPasswordValid.value = false;
    return '';
  }

  if (confirmPassword !== password) {
    confirmPasswordValid.value = false;
    return '两次输入的密码不一致';
  }

  confirmPasswordValid.value = true;
  return '';
};

const handleConfirmPasswordInputChange = debounce(() => {
  confirmPasswordTip.value = validateConfirmPassword();
}, 300);

const resetForm = () => {
  registerForm.username = '';
  registerForm.account = '';
  registerForm.password = '';
  registerForm.confirmPassword = '';

  //提示信息以及验证状态更新
  usernameTip.value = '';
  phoneTip.value = '';
  passwordTip.value = '';
  confirmPasswordTip.value = '';
  usernameValid.value = false;
  phoneValid.value = false;
  passwordValid.value = false;
  confirmPasswordValid.value = false;
  message.value = '';
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
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
}

input.error {
  border-color: #ff6b6b;
}

.message {
  color: #ff6b6b;
  font-size: 14px;
  margin-top: 10px;
}

.success {
  color: #4caf50;
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
  font-size: 11px;
  color: #ccc;
  margin-top: 4px;
  transition: all 0.3s ease;
  min-height: 16px;
}

.input-tip.error {
  color: #ff6b6b;
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.strength-bar {
  height: 4px;
  width: 100px;
  border-radius: 2px;
  background-color: #333;
  position: relative;
  overflow: hidden;
}

.strength-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-bar.weak::after {
  width: 33%;
  background-color: #ff6b6b;
}

.strength-bar.medium::after {
  width: 66%;
  background-color: #ff9800;
}

.strength-bar.strong::after {
  width: 100%;
  background-color: #4caf50;
}

.strength-text {
  font-size: 11px;
  color: #ccc;
}

.strength-bar.weak + .strength-text {
  color: #ff6b6b;
}

.strength-bar.medium + .strength-text {
  color: #ff9800;
}

.strength-bar.strong + .strength-text {
  color: #4caf50;
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
