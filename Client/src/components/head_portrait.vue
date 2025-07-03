<template>
  <div id="box">
    <img :src="userStore.avatar || '../../public/avatar/doro.png'" class="img" alt="用户头像" />
    <ul class="droplist">
      <li class="change-avatar">更换头像</li>
      <li @click="confirmLogout" class="log-out">退出登录</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// import { storeToRefs } from 'pinia';
// import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore'; // 使用userStore
import { useCodeStore } from '@/stores/codeStore'; // 使用codeStore
// import CodePenLogo from './icons/CodePenLogo.vue';
// import CloudIcon from './icons/CloudIcon.vue';
// import SettingsIcon from './icons/SettingsIcon.vue';
// import UnifiedButton from '@/components/ui/UnifiedButton.vue';
import { api } from '@/api';
import { ShareService } from '@/services/shareService';

const userStore = useUserStore();
// const codeStore = useCodeStore();
const emit = defineEmits(['login']);

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

const confirmLogout = () => {
  const confirmed = window.confirm('确定要退出登录吗？');
  if (confirmed) {
    logout();
  }
};

const logout = async () => {
  try {
    const response = await api.logout();
    if (response.code === 200) {
      userStore.logout();
      window.location.reload(); // 退出登录后刷新页面
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
  /* display: none; */
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

#box:hover .droplist {
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
</style>
