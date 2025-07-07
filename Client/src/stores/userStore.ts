import { set } from 'lodash-es';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/api';

export interface ProjectPermissions {
  isOwner: boolean;
  accessType: 'owner' | 'readonly';
}

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const username = ref('');
  const account = ref('');
  const avatar = ref('');
  const status = ref('left');
  const createAt = ref('');

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

  const login = (
    newUsername: string,
    newAccount: string,
    newAvatar: string,
    newStatus: string,
    newCreateAt: string
  ) => {
    setUsername(newUsername);
    setAccount(newAccount);
    setAvatar(newAvatar);
    setStatus(newStatus);
    setCreateAt(newCreateAt);
    isLoggedIn.value = true;
  };

  const logout = () => {
    // 清除登录状态
    isLoggedIn.value = false;

    // 清除用户信息
    username.value = '';
    account.value = '';
    avatar.value = '';
    status.value = 'left';
    createAt.value = '';

    // 清除项目相关状态
    currentProjectId.value = null;

    // 登出时清除权限
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

  const toggleView = async (newStatus: string) => {
    // 切换视图状态
    setStatus(newStatus);
    if (isLoggedIn.value) {
      try {
        const { data: userProfileData } = await api.getUserProfile();
        const userId = userProfileData.user.id;
        console.log('当前用户 ID:', userId);
        if (!userId) {
          console.error('未找到 userid，请检查登录状态');
          return;
        }
        // 调用 updateUserProfile 方法更新后台的用户资料
        await api.updateUserProfile({
          user: {
            id: userId,
            username: username.value,
            account: account.value,
            status: status.value,
          },
        });
        console.log('视图状态更新成功');
      } catch (error) {
        console.error('视图状态更新失败:', error);
      }
    }
  };
  return {
    username,
    account,
    avatar,
    status,
    isLoggedIn,
    currentProjectId,
    currentPermissions,
    isReadOnlyMode,
    setUsername,
    setAccount,
    setAvatar,
    setStatus,
    setCreateAt,
    login,
    logout,
    toggleView,
    setPermissions,
    clearPermissions,
  };
});
