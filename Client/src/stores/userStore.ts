import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/api';

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userid = ref('');
  const username = ref('');
  const account = ref('');
  const avatar = ref('');
  const status = ref('true');
  const createAt = ref('');

  const isLoggedIn = ref(false);

  const setUsername = (newUsername: string) => {
    username.value = newUsername;
  };

  const setAccount = (newAccount: string) => {
    account.value = newAccount;
  };

  const setAvatar = (newAvatar: string) => {
    avatar.value = newAvatar;
  };

  const setStatus = (newStatus: string) => {
    status.value = newStatus;
  };

  const setCreateAt = (newCreateAt: string) => {
    createAt.value = newCreateAt;
  };

  const login = () => {
    isLoggedIn.value = true;
  };

  const logout = () => {
    isLoggedIn.value = false;
  };

  const toggleView = async () => {
    // 切换视图状态
    status.value = status.value === 'true' ? 'false' : 'true';
    try {
      // 调用 updateUserProfile 方法更新后台的用户资料
      await api.updateUserProfile({
        user: {
          id: userid.value,
          username: username.value,
          account: account.value,
          status: status.value,
        },
      });
      console.log('视图状态更新成功');
    } catch (error) {
      console.error('视图状态更新失败:', error);
    }
  };
  return {
    username,
    userid,
    account,
    avatar,
    status,
    isLoggedIn,
    setUsername,
    setAccount,
    setAvatar,
    setStatus,
    setCreateAt,
    login,
    logout,
    toggleView,
  };
});
