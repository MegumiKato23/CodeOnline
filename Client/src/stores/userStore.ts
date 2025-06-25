import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const username = ref('');
  const account = ref('');
  const avatar = ref('');
  const status = ref('');
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

  return {
    username,
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
  };
});
