<template>
  <div id="box">
    <img
      :src="userStore.avatar || '../../public/avatar/doro.png'"
      class="img"
      alt="用户头像"
      @error="handleImageError"
      @mouseenter="handleAvatarEnter"
      @mouseleave="handleAvatarLeave"
    />
    <ul class="droplist" v-show="isDropdownVisible" @mouseenter="handleDropdownEnter" @mouseleave="handleDropdownLeave">
      <li class="change-avatar" @click="handleAvatarChange">更换头像</li>
      <li @click="showLogoutConfirm = true" class="log-out">退出登录</li>
    </ul>
    <input type="file" ref="avatarInput" accept="image/*" style="display: none" @change="handleFileUpload" />

    <div class="logout-confirm-dialog" v-if="showLogoutConfirm">
      <div class="logout-confirm-content">
        <h3>退出登录</h3>
        <p>确定要退出登录吗？系统将保存您的最新代码</p>
        <div class="dialog-actions">
          <button class="cancel-btn" @click="close">取消</button>
          <button class="logout-btn" @click="confirmLogout">退出登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore'; // 使用userStore
import { useCodeStore } from '@/stores/codeStore'; // 使用codeStore
// import CodePenLogo from './icons/CodePenLogo.vue';
// import CloudIcon from './icons/CloudIcon.vue';
// import SettingsIcon from './icons/SettingsIcon.vue';
// import UnifiedButton from '@/components/ui/UnifiedButton.vue';
import { api } from '@/api';
import { ShareService } from '@/services/shareService';

const userStore = useUserStore();
const codeStore = useCodeStore();
const emit = defineEmits(['login']);
const showLogoutConfirm = ref(false);
const isLoading = ref(false);
const uploadError = ref('');
const isDropdownVisible = ref(false);
const dropdownTimeout = ref<NodeJS.Timeout>();

const handleAvatarEnter = () => {
  console.log('鼠标进入头像');
  clearTimeout(dropdownTimeout.value);
  isDropdownVisible.value = true;
};

const handleAvatarLeave = () => {
  console.log('鼠标离开头像');
  if (!isDropdownVisible.value) return;
  dropdownTimeout.value = setTimeout(() => {
    isDropdownVisible.value = false;
    console.log('隐藏下拉框');
  }, 100);
};

const handleDropdownEnter = () => {
  console.log('鼠标进入下拉框');
  clearTimeout(dropdownTimeout.value);
};

const handleDropdownLeave = () => {
  console.log('鼠标离开下拉框');
  isDropdownVisible.value = false;
};

// // 控制下拉框显示状态
// const isDropdownVisible = ref(false);

// // 显示下拉框
// const showDropdown = () => {
//   isDropdownVisible.value = true;
// };

// // 隐藏下拉框
// const hideDropdown = () => {
//   setTimeout(() => {
//     isDropdownVisible.value = false;
//   }, 1000);
// };

const handleAvatarChange = () => {
  (document.querySelector('input[type="file"]') as HTMLInputElement).click();
};

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    isLoading.value = true;
    uploadError.value = '';
    try {
      const file = input.files[0];
      console.log('开始处理头像文件:', file.name, file.size);

      // 验证文件类型和大小
      if (!file.type.startsWith('image/')) {
        throw new Error('请选择有效的图片文件');
      }
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('图片大小不能超过2MB');
      }

      // 将头像转为base64并验证
      const avatarData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result && result.startsWith('data:image')) {
            console.log('头像转换成功，大小:', result.length);
            resolve(result);
          } else {
            reject(new Error('头像转换失败: 无效的数据格式'));
          }
        };
        reader.onerror = () => reject(new Error('头像读取失败'));
        reader.readAsDataURL(file);
      });

      // 持久化存储
      console.log('存储头像到localStorage');
      localStorage.setItem('userAvatar', avatarData);
      userStore.setAvatar(avatarData);

      // 更新后端
      const profileResponse = await api.getUserProfile();
      if (profileResponse.code !== 200) {
        throw new Error('获取用户信息失败');
      }

      const userId = profileResponse.data.user.id;
      const response = await api.updateUserProfile({
        user: {
          id: userId,
          username: userStore.username,
          account: userStore.account,
          avatar: avatarData,
          status: userStore.status,
        },
      });

      if (response.code !== 200) {
        throw new Error(response.message || '头像更新失败');
      }

      console.log('头像更新成功');
      input.value = '';
    } catch (error) {
      console.error('头像上传失败:', error);
      uploadError.value = error.message || '头像上传失败';
      alert(`头像更新失败: ${uploadError.value}`);
    }
  }
};

const confirmLogout = async () => {
  try {
    // 1. 保存Redis数据到数据库
    await saveRedisToDatabase();

    // 2. 执行退出登录
    await logout();
  } catch (error) {
    console.error('退出登录过程中出错:', error);
    alert('保存代码失败，请手动保存后再退出');
  }
};

const close = () => {
  showLogoutConfirm.value = false;
};

const saveRedisToDatabase = async () => {
  if (!userStore.isLoggedIn) return;

  try {
    // 1. 获取当前项目ID
    const currentProjectId = userStore.currentProjectId;
    console.log('当前项目ID:', currentProjectId);
    if (!currentProjectId) throw new Error('未设置当前项目');

    // 2. 从Redis获取文件内容
    const codeResponse = await api.getCode(userStore.account);
    const filesToUpdate = codeResponse.data?.files || [];
    console.log('待更新文件:', filesToUpdate);
    if (filesToUpdate.length === 0) return;

    // 3. 获取项目文件列表
    const projectResponse = await api.getProject(currentProjectId);
    const projectData = projectResponse.data?.project || projectResponse.data;
    const existingFiles = projectData?.files || [];
    console.log('现有文件列表:', existingFiles);

    // 4. 创建文件名到ID的映射
    const fileIdMap = new Map();
    existingFiles.forEach((file) => {
      fileIdMap.set(file.name, file.id);
    });
    console.log('文件ID映射表:', Object.fromEntries(fileIdMap));

    // 5. 执行文件更新
    const updateResults = await Promise.all(
      filesToUpdate.map(async (file) => {
        try {
          const fileId = fileIdMap.get(file.name);
          if (!fileId) {
            console.warn(`未找到文件 ${file.name} 的ID，跳过更新`);
            return { name: file.name, status: 'skipped' };
          }

          console.log(`正在更新 ${file.name} (ID: ${fileId})`);
          const updateResponse = await api.updateFile(currentProjectId, fileId, {
            name: file.name,
            path: file.path,
            content: file.content,
            type: file.type,
          });

          if (updateResponse.code !== 200) {
            throw new Error(updateResponse.message || '更新失败');
          }
          return { name: file.name, status: 'success' };
        } catch (error) {
          console.error(`文件 ${file.name} 更新失败:`, error);
          return {
            name: file.name,
            status: 'failed',
            error: error.message,
          };
        }
      })
    );

    // 6. 检查更新结果
    const failedUpdates = updateResults.filter((r) => r.status === 'failed');
    if (failedUpdates.length > 0) {
      console.error('以下文件更新失败:', failedUpdates);
      throw new Error(`${failedUpdates.length}个文件更新失败`);
    }

    console.log('Redis数据保存完成:', {
      success: updateResults.filter((r) => r.status === 'success').length,
      skipped: updateResults.filter((r) => r.status === 'skipped').length,
    });
  } catch (error) {
    console.error('保存Redis数据失败:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    throw error; // 抛出错误让上层处理
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  console.warn('头像加载失败，尝试恢复...');

  // 尝试从多个来源恢复头像
  const sources = [localStorage.getItem('userAvatar'), userStore.avatar, '../../public/avatar/doro.png'];

  for (const source of sources) {
    if (source) {
      img.src = source;
      console.log(
        '从',
        source === sources[0] ? 'localStorage' : source === sources[1] ? 'userStore' : '默认路径',
        '恢复头像'
      );
      uploadError.value = '头像恢复成功';
      return;
    }
  }

  console.error('所有头像恢复尝试失败');
  uploadError.value = '头像加载失败';
};

const logout = async () => {
  try {
    console.log('开始退出登录流程');
    const response = await api.logout();
    if (response.code === 200) {
      console.log('退出登录成功，清理缓存');
      // 保留头像缓存以便重新登录后恢复
      // localStorage.removeItem('userAvatar'); // 注释掉这行以保留缓存
      userStore.logout();
      setTimeout(() => {
        window.location.reload(); // 延迟刷新以确保清理完成
      }, 100);
    }
  } catch (error) {
    console.error('退出登录失败:', error);
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  text-decoration: none;
  list-style: none;
}

#box {
  /* position: relative; */
  /* display: inline-block; */
  width: 50px;
  /* height: 20px; */
}

.img {
  width: 43px;
  height: 43px;
  position: absolute;
  border-radius: 100%;
  top: 8px;
  right: 14px;
}

#box .img:hover {
  cursor: pointer;
}

.droplist {
  background-color: #1a1a1a;
  display: block;
  position: absolute;
  top: 56px;
  right: 8px;
  padding: 5px 0 10px;
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
  width: 100px;
  z-index: 999;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

#box .img:hover ~ .droplist,
.droplist:hover {
  opacity: 1;
  transform: translateY(0);
}

.droplist li {
  height: 40px;
  width: 100px;
  font-size: 16px;
  /* padding-left: 12px; */
  text-align: center;
  line-height: 40px;
}

.droplist li:hover {
  cursor: pointer;
  background-color: hsl(227.37deg 12.26% 30.39%);
}

.logout-confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.logout-confirm-content {
  background-color: #2a2a2a;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  padding: 20px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  background-color: #444;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn {
  background-color: #e53935;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* .droplist .change-avatar {

  font-size: 8px;
  text-align: center;
  line-height: 20px;
  position: absolute;
  border: 1px solid grey;
  top: 0px;
  left: 0px;
}

.droplist .log-out {
  height: 20px;
  width: 100px;
  font-size: 8px;
  text-align: center;
  line-height: 20px;
  position: absolute;
  top: 20px;
  left: 0px;
  border-left: 1px solid grey;
  border-right: 1px solid grey;
  border-bottom: 1px solid grey;
} */

/*
a1:hover {
  cursor: pointer;
  background-color: rgba(196, 205, 215, 0.83);
}
a2:hover {
  cursor: pointer;
  background-color: rgba(196, 205, 215, 0.83);
} */
</style>
