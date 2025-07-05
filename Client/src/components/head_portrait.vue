<template>
  <!-- bao'cun -->
  <div id="box" style="position: relative; width: 50px; height: 50px">
    <img
      :src="userStore.avatar || '../../public/avatar/doro.png'"
      class="img"
      alt="用户头像"
      baocun
      @mouseenter="showDropdown = true"
      @mouseleave="onImgLeave"
      style="position: absolute; width: 43px; height: 43px; border-radius: 100%; top: 0; right: 14px"
    />
    <ul
      class="droplist"
      v-show="showDropdown"
      @mouseenter="showDropdown = true"
      @mouseleave="showDropdown = false"
      style="pointer-events: auto"
    >
      <li class="change-avatar" @click="triggerFileInput">更换头像</li>
      <li @click="confirmLogout" class="log-out">退出登录</li>
    </ul>
    <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleAvatarChange" />
  </div>
  <!-- 退出登录确认弹窗 -->
  <div v-if="showLogoutDialog" class="logout-overlay" @click.self="cancelLogout">
    <div class="logout-dialog">
      <div class="logout-header">
        <h2>退出登录</h2>
        <button class="close-btn" @click="cancelLogout">×</button>
      </div>
      <div class="logout-body">
        <div class="logout-message">确定要退出登录吗？</div>
      </div>
      <div class="logout-footer">
        <button class="btn cancel-btn" @click="cancelLogout">取消</button>
        <button class="btn logout-submit-btn" @click="handleLogout">退出</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { api } from '@/api';
import { ShareService } from '@/services/shareService';

const userStore = useUserStore();
const emit = defineEmits(['login']);

const fileInput = ref<HTMLInputElement | null>(null);
const showLogoutDialog = ref(false);
const showDropdown = ref(false);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const compressImage = (file: File, maxWidth = 100, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', quality);
      resolve(base64);
    };
    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleAvatarChange = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (!files || files.length === 0) return;
  const file = files[0];

  // 更小尺寸和更低质量
  const base64 = await compressImage(file, 100, 0.7); // 24px宽，20%质量
  userStore.setAvatar(base64);

  // 打印 base64 长度
  console.log('base64长度:', base64.length);

  console.log('上传头像时 userStore.userid:', userStore.userid);

  try {
    await api.updateUserProfile({
      user: {
        id: userStore.userid,
        username: userStore.username,
        account: userStore.account,
        status: userStore.status,
        avatar: base64,
      },
    });
  } catch (err) {
    console.error('头像保存失败', err);
  }
};

const confirmLogout = () => {
  showLogoutDialog.value = true;
};

const handleLogout = async () => {
  showLogoutDialog.value = false;
  await logout();
};

const cancelLogout = () => {
  showLogoutDialog.value = false;
};

const logout = async () => {
  try {
    const response = await api.logout();
    if (response.code === 200) {
      userStore.logout();
      const shareResult = await ShareService.checkShareAccess();
      if (shareResult.success) {
        ShareService.applyShareAccess(shareResult);
      }
    }
  } catch (error) {
    console.error('退出登录失败:', error);
  }
};

const onImgLeave = (e: MouseEvent) => {
  // 如果鼠标进入了 droplist，不隐藏
  const related = e.relatedTarget as HTMLElement;
  if (related && related.classList && related.classList.contains('droplist')) {
    return;
  }
  showDropdown.value = false;
};

console.log('当前用户ID:', userStore.userid);
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  text-decoration: none;
  list-style: none;
}

#box {
  position: relative;
  width: 43px; /* 与头像宽度一致 */
  height: 50px;
}

.img {
  width: 43px;
  height: 43px;
  position: absolute;
  border-radius: 100%;
  top: 0;
  right: 0; /* 让头像紧贴父容器右侧 */
  z-index: 999;
}

#box .img:hover {
  cursor: pointer;
}

.droplist {
  background-color: #1a1a1a;
  position: absolute;
  top: 43px; /* 紧贴头像底部 */
  right: 8px; /* 可与头像右侧对齐 */
  padding: 5px 0 10px;
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
  width: 100px;
  z-index: 999;
  pointer-events: auto;
}

#box:hover ul {
  display: block;
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

.logout-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.logout-dialog {
  background-color: #2a2a2a;
  border-radius: 8px;
  width: 320px;
  max-width: 90%;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.logout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #3a3a3a;
}

.logout-header h2 {
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

.logout-body {
  padding: 20px;
  text-align: center;
}

.logout-message {
  font-size: 16px;
  margin-bottom: 10px;
}

.logout-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

.cancel-btn {
  background-color: transparent;
  color: #ccc;
  border: 1px solid #555;
}

.logout-submit-btn {
  background-color: #4a9eff;
  color: white;
}

.logout-submit-btn:hover {
  background-color: #3a8eef;
}
</style>
