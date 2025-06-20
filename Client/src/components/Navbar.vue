<template>
  <nav class="navbar">
    <!-- 左侧部分：Logo + 标题/作者 -->
    <div class="left">
      <CodePenLogo class="logo" />
      <div class="title-area">
        <h1 class="title">{{ title }}</h1>
        <div class="teamname">by {{ teamname }}</div>
      </div>
    </div>

    <!-- 右侧部分：操作按钮 -->
    <div class="right">
      <button 
        class="btn save-btn" 
        :class="{ saved }"
        @click="saveCode"
      >
        <CloudIcon class="icon" />
        <span>{{ saved ? 'Saved' : 'Save' }}</span>
      </button>
      
      <button class="btn settings-btn" @click="openSettings">
        <SettingsIcon class="icon" />
        <span>Settings</span>
      </button>
      
      <button class="btn download-btn" @click="download">
        <DownloadIcon class="icon" />
        <span>Download</span>
      </button>
      
      <button v-if="!isLoggedIn" class="btn login-btn" @click="login">
        <span>Log In</span>
      </button>
      
      <button v-else class="btn user-btn">
        <span>{{ username }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import CodePenLogo from './icons/CodePenLogo.vue'
import DownloadIcon from './icons/DownloadIcon.vue'
import CloudIcon from './icons/CloudIcon.vue'
import SettingsIcon from './icons/SettingsIcon.vue'

const emit = defineEmits(['login'])

const editorStore = useEditorStore()
const { saved, username, title, isLoggedIn, teamname } = storeToRefs(editorStore)

const saveCode = () => {
  editorStore.saveCode()
  console.log('Code saved')
}

const openSettings = () => {
  console.log('Open settings')
}

const download = () => {
  editorStore.saveCode()
  console.log('Download code')
}

const login = () => {
  emit('login')
}
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

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.save-btn {
  background: #5a5f73;
  color: white;
}

.save-btn.saved {
  background: rgba(0, 200, 0, 0.2);
  color: #0f0;
}

.settings-btn {
  background: #5a5f73;
  color: white;
}

.download-btn {
  background: #47cf73;
  color: black;
}

.login-btn {
  background: #5a5f73;
  color: white;
}

.user-btn {
  background-color: #333;
  color: white;
  border: 1px solid #444;
}

.username {
  font-size: 12px;
  color: #999;
}

.icon {
  width: 16px;
  height: 16px;
}
</style>