import { set } from 'lodash-es';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ProjectPermissions {
  isOwner: boolean;
  accessType: 'owner' | 'readonly';
}

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const username = ref('');
  const account = ref('');
  const avatar = ref('');
  const status = ref('');
  const createAt = ref('');
  const userId = ref('');

  const isLoggedIn = ref(false);

  const currentProjectId = ref(null);

  // 权限相关状态
  const currentPermissions = ref<ProjectPermissions | null>(null);
  const isReadOnlyMode = ref(false);

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

  const setUserId = (newUserId: string) => {
    userId.value = newUserId;
  };

  const login = () => {
    isLoggedIn.value = true;
  };

  const logout = () => {
    // 清除登录状态
    isLoggedIn.value = false;

    // 清除用户信息
    username.value = '';
    account.value = '';
    avatar.value = '';
    status.value = '';
    createAt.value = '';
    userId.value = '';

    // 清除项目相关状态
    currentProjectId.value = null;

    // 清除权限
    clearPermissions();
  };

  // 权限管理方法
  const setPermissions = (permissions: ProjectPermissions) => {
    currentPermissions.value = permissions;
    isReadOnlyMode.value = permissions.accessType === 'readonly';
  };

  const clearPermissions = () => {
    currentPermissions.value = null;
    isReadOnlyMode.value = false;
  };

  return {
    username,
    account,
    avatar,
    status,
    userId,
    isLoggedIn,
    currentProjectId,
    currentPermissions,
    isReadOnlyMode,
    setUsername,
    setAccount,
    setAvatar,
    setStatus,
    setCreateAt,
    setUserId,
    login,
    logout,
    setPermissions,
    clearPermissions,
  };
});
