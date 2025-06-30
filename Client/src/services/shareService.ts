import { api } from '@/api';
import { useUserStore } from '@/stores/userStore';
import { useCodeStore } from '@/stores/codeStore';
import type { ProjectPermissions } from '@/stores/userStore';

export interface ShareAccessResult {
  success: boolean;
  permissions?: ProjectPermissions;
  projectData?: any;
  error?: string;
}

export class ShareService {
  /**
   * 检查分享链接访问权限
   * @param shareId 分享ID，如果不提供则从当前URL解析
   * @param userId 用户ID，如果不提供则从userStore获取
   */

  static async checkShareAccess(options?: { shareId?: string }): Promise<ShareAccessResult> {
    try {
      let { shareId } = options || {};

      // 如果没有提供shareId，从URL解析
      if (!shareId) {
        const url = window.location.pathname;
        const shareMatch = url.match(/\/share\/(.+)/);
        if (!shareMatch) {
          return { success: false, error: '无效的分享链接' };
        }
        shareId = shareMatch[1];
      }

      console.log('分享ID:', shareId);

      const { data: sharedProjectData } = await api.getSharedProject(shareId);
      const projectData = sharedProjectData.project;
      console.log('分享项目数据:', projectData.ownerId); // Log the project data for diagnostic purpose

      let userId: string | null = null;
      let permissions: ProjectPermissions;

      try {
        // 有cookie时尝试获取用户信息
        const { data: userProfileData } = await api.getUserProfile();
        userId = userProfileData.user.id;
        console.log('用户ID:', userId);

        // 确定权限
        permissions = {
          isOwner: projectData.ownerId === userId,
          accessType: projectData.ownerId === userId ? 'owner' : 'readonly',
        };
      } catch (error) {
        // 如果获取用户信息失败，设置为只读权限
        console.log('获取用户信息失败，设置为只读权限');
        permissions = {
          isOwner: false,
          accessType: 'readonly',
        };
      }

      console.log('权限检查结果:', permissions);

      return {
        success: true,
        permissions,
        projectData,
      };
    } catch (error) {
      console.error('Failed to load shared project:', error);
      return {
        success: false,
        error: '分享项目加载失败，请检查链接是否有效',
      };
    }
  }

  /**
   * 应用分享项目的权限和数据
   */
  static applyShareAccess(result: ShareAccessResult): void {
    if (!result.success || !result.permissions || !result.projectData) {
      return;
    }

    const userStore = useUserStore();
    const codeStore = useCodeStore();

    // 设置权限
    userStore.setPermissions(result.permissions);

    // 加载项目数据到编辑器
    codeStore.loadProjectFromShare(result.projectData);

    // 显示提示信息
    if (result.permissions.accessType === 'readonly') {
      console.log(`您正在以只读模式访问项目: ${result.projectData.name || '未命名项目'}`);
    }

    console.log('分享项目加载完成');
  }
}
