<template>
  <nav class="navbar">
    <!-- 左侧部分：Logo + 标题/作者 -->
    <div class="left">
      <CodePenLogo class="logo" />
      <div class="title-area">
        <h1 class="title">CodeOnline</h1>
        <div class="teamname">从容应队</div>
      </div>
    </div>

    <!-- 右侧部分：操作按钮 -->
    <div class="right">
      <el-dropdown @command="handleCommand" class="custom-dropdown">
        <span class="el-dropdown-link custom-dropdown-link">
          Views
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="custom-dropdown-menu">
            <el-dropdown-item command="left">Left</el-dropdown-item>
            <el-dropdown-item command="right">Right</el-dropdown-item>
            <el-dropdown-item command="top">Top</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <UnifiedButton
        type="primary"
        size="large"
        class="save-btn"
        :class="{ saved }"
        :icon="CloudIcon"
        :disabled="userStore.isReadOnlyMode"
        @click="saveCode"
      >
        <span>{{ saved ? 'Saved' : 'Save' }}</span>
      </UnifiedButton>

      <UnifiedButton type="primary" size="large" :icon="SettingsIcon" @click="openSettings">
        <span>Settings</span>
      </UnifiedButton>

      <!-- 根据登录状态显示登录按钮或头像 -->
      <UnifiedButton v-if="!isLoggedIn" type="primary" size="large" @click="login">
        <span>Log In</span>
      </UnifiedButton>
      <HeadPortrait v-else />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useCodeStore } from '@/stores/codeStore';
import CodePenLogo from './icons/CodePenLogo.vue';
import CloudIcon from './icons/CloudIcon.vue';
import SettingsIcon from './icons/SettingsIcon.vue';
import UnifiedButton from '@/components/ui/UnifiedButton.vue';
import ViewIcon from './icons/ViewIcon.vue';
import HeadPortrait from './head_portrait.vue';

const emit = defineEmits(['login', 'openSettings']);

const userStore = useUserStore();
const codeStore = useCodeStore();
const { username, userid, account, avatar, isLoggedIn, status } = storeToRefs(userStore);
const { saved } = storeToRefs(codeStore);

const handleCommand = (command: string) => {
  //console.log(command)
  userStore.toggleView(command);
};
const saveCode = async () => {
  if (!userStore.isLoggedIn) {
    console.log('请先登录再保存');
    return;
  }
  try {
    // 自动格式化当前标签页的代码
    await codeStore.formatCurrentCode();
    // 保存到Redis
    await codeStore.saveCode(userStore.account);
  } catch (error) {
    console.error('保存过程中出错:', error);
  }
};

const openSettings = () => {
  emit('openSettings');
};

const login = () => {
  emit('login');
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  height: 60px;
  background: #1a1a1a;
  color: white;
  border-bottom: 1px solid #333;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 30px;
  height: 30px;
}

.title-area {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 16px;
  margin: 0;
  font-weight: normal;
}

.teamname {
  font-size: 12px;
  color: #999;
}

.right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* .btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
} */

/* .view-btn {
  background: #5a5f73;
  color: white;
} */

/* .save-btn {
>>>>>>> 6ac46b573d96a030b244ebc93de1a3181e0c461c
  background: #5a5f73;
  color: white;
} */

.save-btn.saved {
  background: rgba(0, 200, 0, 0.2);
  color: #0f0;
}

/* .settings-btn {
  background: #5a5f73;
  color: white;
}

.login-btn {
  background: #5a5f73;
  color: white;
} */

.user-btn {
  background-color: #333;
  color: white;
  border: 1px solid #444;
}

.username {
  font-size: 12px;
  color: #999;
}

/* .icon {
  width: 16px;
  height: 16px;
} */

/* 按钮样式 */
.custom-dropdown-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background-color: #444857; /* 与primary按钮相同的背景色 */
  color: #fff; /* 白色文字 */
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: none; /* 去掉悬停时的边框 */
  outline: none; /* 去掉悬停时的轮廓 */
}

.custom-dropdown-link:hover {
  background-color: #999; /* 悬停时改变背景色 */
  border: none; /* 去掉悬停时的边框 */
  outline: none; /* 去掉悬停时的轮廓 */
}

/* 下拉菜单样式 */
.custom-dropdown-menu {
  background-color: #1a1a1a;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
}

/* 下拉菜单项样式 */
.custom-dropdown-menu .el-dropdown-item {
  font-size: 14px;
  color: white;
}

.custom-dropdown-menu .el-dropdown-item:hover {
  background-color: hsl(227.37deg 12.26% 30.39%); /* 悬停时改变背景色 */
}
</style>
