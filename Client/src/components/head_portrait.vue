<template>
  <div id="box">
    <img src="" class="img" />
    <ul class="droplist">
      <li><a1 style="color: black">更换头像</a1></li>
      <li><a2 @click="confirmLogout" style="color: black">退出登录</a2></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useUserStore } from '@/stores/userStore'; // 使用userStore
import { useCodeStore } from '@/stores/codeStore'; // 使用codeStore
import CodePenLogo from './icons/CodePenLogo.vue';
import CloudIcon from './icons/CloudIcon.vue';
import SettingsIcon from './icons/SettingsIcon.vue';
import UnifiedButton from '@/components/ui/UnifiedButton.vue';

const emit = defineEmits(['login']);

const confirmLogout = () => {
  const confirmed = window.confirm('确定要退出登录吗？');
  if (confirmed) {
    logout();
  }
};

const logout = async () => {
  try {
    const { success } = await api.logout();
    if (success) {
      userStore.logout();
      // 退出登录后,检查权限
      const shareResult = await ShareService.checkShareAccess({ userId: userStore.userId });
      if (shareResult.success) {
        ShareService.applyShareAccess(shareResult);
      }
    }
  } catch (error) {
    console.error('退出登录失败:', error);
  }
};
</script>

<style scoped>
#box {
  width: 40px;
  height: 40px;
  position: relative;
  /*top: 80px;
  margin: 0; */
  top: -733px;
  left: 1050px;

  /* right: 20px; */
}
.img {
  width: 50px;
  height: 50px;
  position: absolute;
  border-radius: 100%;
  top: 0;
  left: 0;
}
#box .img:hover {
  cursor: pointer;
}
.droplist {
  background-color: black;
  display: none;
  position: absolute;
  top: 50px;
  left: 6px;
  z-index: 999;
>>>>>>> Stashed changes
}
#box:hover .droplist {
  display: block;
}
.droplist a1 {
  height: 20px;
  width: 38px;
  font-size: 8px;
  text-align: center;
  line-height: 20px;
  position: absolute;
  border: 1px solid grey;
  top: 0px;
  left: 0px;
}
.droplist a2 {
  height: 20px;
  width: 38px;
  font-size: 8px;
  text-align: center;
  line-height: 20px;
  position: absolute;
  top: 20px;
  left: 0px;
  border-left: 1px solid grey;
  border-right: 1px solid grey;
  border-bottom: 1px solid grey;
}

* {
  margin: 0;
  padding: 0;
  text-decoration: none;
  list-style: none;
}
a1:hover {
  cursor: pointer;
  background-color: rgba(196, 205, 215, 0.83);
}
a2:hover {
  cursor: pointer;
  background-color: rgba(196, 205, 215, 0.83);
}
</style>
