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
      <UnifiedButton type="primary" size="large" :class="{ saved }" :icon="CloudIcon" @click="saveCode">
        <span>{{ saved ? 'Saved' : 'Save' }}</span>
      </UnifiedButton>

      <UnifiedButton type="primary" size="large" :icon="SettingsIcon" @click="openSettings">
        <span>Settings</span>
      </UnifiedButton>

      <!-- 根据登录状态显示登录按钮或头像 -->
      <UnifiedButton v-if="!isLoggedIn" type="primary" size="large" @click="login">
        <span>Log In</span>
      </UnifiedButton>
      <UnifiedButton v-else>
        <HeadPortrait />
      </UnifiedButton>
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
import HeadPortrait from './head_portrait.vue';

const emit = defineEmits(['login']);

const userStore = useUserStore();
const codeStore = useCodeStore();
const { username, isLoggedIn } = storeToRefs(userStore);
const { saved } = storeToRefs(codeStore);

const saveCode = () => {
  if (!userStore.isLoggedIn) {
    console.log('请先登录再保存');
    return;
  }
  codeStore
    .saveCode(userStore.account)
    .then(() => {
      console.log('代码保存成功');
    })
    .catch(() => {
      console.log('代码保存失败');
    });
};

const openSettings = () => {
  console.log('Open settings');
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

/* .save-btn {
  background: #5a5f73;
  color: white;
} */

/* .save-btn.saved {
  background: rgba(0, 200, 0, 0.2);
  color: #0f0;
} */

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
</style>
