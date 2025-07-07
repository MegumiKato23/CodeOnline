<template>
  <div class="project-list-overlay" v-if="visible" @click.self="close">
    <div class="project-list-dialog">
      <div class="project-list-header">
        <h2>我的项目</h2>
        <button class="close-btn" @click="close">×</button>
      </div>
      <div class="project-list-body">
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        <div v-else-if="projects.length === 0" class="empty-message">暂无项目，请创建新项目</div>
        <div v-else class="project-list">
          <div
            v-for="project in projects"
            :key="project.id"
            class="project-item"
            :class="{ active: project.id === currentProjectId }"
            @click="selectProject(project.id)"
          >
            <div class="project-info">
              <h3 class="project-name" v-if="editingProjectId !== project.id">{{ project.name }}</h3>
              <input
                v-else
                type="text"
                v-model="editingProjectName"
                class="project-name-input"
                @click.stop
                @keyup.enter="saveProjectName(project.id)"
                @keyup.esc="cancelEditProjectName()"
                ref="projectNameInput"
              />
              <p class="project-date">更新时间: {{ formatDate(project.updatedAt) }}</p>
            </div>
            <div class="project-actions" @click.stop>
              <button
                class="action-btn edit-btn"
                @click="editProjectName(project.id, project.name)"
                v-if="editingProjectId !== project.id"
              >
                <span class="icon">✎</span>
              </button>
              <button class="action-btn save-btn" @click="saveProjectName(project.id)" v-else>
                <span class="icon">✓</span>
              </button>
              <button
                class="action-btn delete-btn"
                @click="confirmDeleteProject(project.id, project.name)"
                v-if="editingProjectId !== project.id"
              >
                <span class="icon">×</span>
              </button>
              <button class="action-btn cancel-btn" @click="cancelEditProjectName()" v-else>
                <span class="icon">✕</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="project-list-footer">
        <UnifiedButton type="primary" size="small" @click="showCreateProjectDialog" :disabled="isCreating">
          <div class="button-content">
            <span>New</span>
          </div>
        </UnifiedButton>
      </div>
    </div>

    <!-- 创建项目对话框 -->
    <div class="create-project-dialog" v-if="showCreateDialog">
      <div class="create-project-content">
        <h3>创建新项目</h3>
        <div class="form-group">
          <label for="projectName">项目名称</label>
          <input
            type="text"
            id="projectName"
            v-model="newProjectName"
            placeholder="请输入项目名称"
            @keyup.enter="createNewProject"
            @keyup.esc="cancelCreateProject"
            ref="newProjectNameInput"
          />
        </div>
        <div class="dialog-actions">
          <button class="cancel-btn" @click="cancelCreateProject">取消</button>
          <button class="confirm-btn" @click="createNewProject" :disabled="isCreating || !newProjectName.trim()">
            <span v-if="isCreating" class="loading-spinner"></span>
            <span>{{ isCreating ? '创建中...' : '创建' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div class="delete-confirm-dialog" v-if="showDeleteConfirm">
      <div class="delete-confirm-content">
        <h3>删除项目</h3>
        <p>确定要删除项目 "{{ projectToDelete.name }}" 吗？此操作不可恢复。</p>
        <div class="dialog-actions">
          <button class="cancel-btn" @click="cancelDeleteProject">取消</button>
          <button class="delete-btn" @click="deleteProject" :disabled="isDeleting">
            <span v-if="isDeleting" class="loading-spinner"></span>
            <span>{{ isDeleting ? '删除中...' : '删除' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useCodeStore } from '@/stores/codeStore';
import { api } from '@/api';
import UnifiedButton from '@/components/ui/UnifiedButton.vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(['close']);

const userStore = useUserStore();
const codeStore = useCodeStore();
const projects = ref<any[]>([]);
const isLoading = ref(false);
const isCreating = ref(false);
const isDeleting = ref(false);
const errorMessage = ref('');
const currentProjectId = ref(userStore.currentProjectId);

// 项目名称编辑相关
const editingProjectId = ref('');
const editingProjectName = ref('');
const projectNameInput = ref<HTMLInputElement | null>(null);

// 创建项目相关
const showCreateDialog = ref(false);
const newProjectName = ref('');
const newProjectNameInput = ref<HTMLInputElement | null>(null);

// 删除项目相关
const showDeleteConfirm = ref(false);
const projectToDelete = ref({ id: '', name: '' });

const close = () => {
  // 如果有正在编辑的项目名，取消编辑
  if (editingProjectId.value) {
    cancelEditProjectName();
  }

  // 如果正在显示创建项目对话框，关闭它
  if (showCreateDialog.value) {
    cancelCreateProject();
  }

  // 如果正在显示删除确认对话框，关闭它
  if (showDeleteConfirm.value) {
    cancelDeleteProject();
  }

  emit('close');
};

const loadProjects = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await api.getUserProjects();
    const { data } = response;

    if (data && data.projects) {
      projects.value = data.projects.sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    } else {
      projects.value = [];
    }
  } catch (error) {
    console.error('获取项目列表失败:', error);
    errorMessage.value = '获取项目列表失败，请稍后重试';
  } finally {
    isLoading.value = false;
  }
};

const selectProject = async (projectId: string) => {
  // 如果正在编辑项目名，不执行选择操作
  if (editingProjectId.value) return;

  if (projectId === userStore.currentProjectId) return;

  try {
    const { data } = await api.getProject(projectId);
    const projectData = data.project;

    // 更新当前项目ID
    userStore.currentProjectId = projectId;
    currentProjectId.value = projectId;

    // 加载项目文件
    codeStore.loadProjectFromShare(projectData);

    // 关闭对话框
    close();
  } catch (error) {
    console.error('加载项目失败:', error);
    alert('加载项目失败，请稍后重试');
  }
};

// 显示创建项目对话框
const showCreateProjectDialog = () => {
  showCreateDialog.value = true;
  newProjectName.value = '';

  // 聚焦到输入框
  nextTick(() => {
    if (newProjectNameInput.value) {
      newProjectNameInput.value.focus();
    }
  });
};

// 取消创建项目
const cancelCreateProject = () => {
  showCreateDialog.value = false;
  newProjectName.value = '';
};

// 创建新项目
const createNewProject = async () => {
  if (isCreating.value || !newProjectName.value.trim()) return;

  isCreating.value = true;

  try {
    // 清空编辑器状态值
    codeStore.loadProjectFromShare({ files: [] });
    const { data } = await api.createProject({ name: newProjectName.value.trim() });
    const projectData = data.project;

    // 初始化项目文件
    await codeStore.initProjectFiles(projectData.id);

    // 更新当前项目ID
    userStore.currentProjectId = projectData.id;
    currentProjectId.value = projectData.id;

    // 重新加载项目列表
    await loadProjects();

    // 关闭创建对话框
    showCreateDialog.value = false;
    newProjectName.value = '';
  } catch (error) {
    console.error('创建项目失败:', error);
    alert('创建项目失败，请稍后重试');
  } finally {
    isCreating.value = false;
    close();
  }
};

// 编辑项目名称
const editProjectName = (projectId: string, projectName: string) => {
  editingProjectId.value = projectId;
  editingProjectName.value = projectName;

  // 聚焦到输入框
  nextTick(() => {
    if (projectNameInput.value) {
      projectNameInput.value.focus();
      projectNameInput.value.select();
    }
  });
};

// 保存项目名称
const saveProjectName = async (projectId: string) => {
  if (!editingProjectName.value.trim()) {
    // 如果名称为空，恢复原名称
    const project = projects.value.find((p) => p.id === projectId);
    if (project) {
      editingProjectName.value = project.name;
    }
    return;
  }

  try {
    await api.updateProject(projectId, { name: editingProjectName.value.trim() });

    // 更新本地项目列表
    const projectIndex = projects.value.findIndex((p) => p.id === projectId);
    if (projectIndex !== -1) {
      projects.value[projectIndex].name = editingProjectName.value.trim();
    }

    // 重置编辑状态
    editingProjectId.value = '';
    editingProjectName.value = '';
  } catch (error) {
    console.error('更新项目名称失败:', error);
    alert('更新项目名称失败，请稍后重试');
  }
};

// 取消编辑项目名称
const cancelEditProjectName = () => {
  editingProjectId.value = '';
  editingProjectName.value = '';
};

// 确认删除项目
const confirmDeleteProject = (projectId: string, projectName: string) => {
  projectToDelete.value = { id: projectId, name: projectName };
  showDeleteConfirm.value = true;
};

// 取消删除项目
const cancelDeleteProject = () => {
  projectToDelete.value = { id: '', name: '' };
  showDeleteConfirm.value = false;
};

// 删除项目
const deleteProject = async () => {
  if (isDeleting.value || !projectToDelete.value.id) return;

  isDeleting.value = true;

  try {
    // 调用API删除项目
    await api.deleteProject(projectToDelete.value.id);

    // 如果删除的是当前项目，需要切换到其他项目
    if (projectToDelete.value.id === currentProjectId.value) {
      // 重新加载项目列表
      await loadProjects();

      // 如果还有其他项目，切换到第一个项目
      if (projects.value.length > 0) {
        await selectProject(projects.value[0].id);
      } else {
        // 如果没有其他项目，创建一个新项目
        const { data } = await api.createProject({ name: 'New Project' });
        const projectData = data.project;
        await codeStore.initProjectFiles(projectData.id);
        userStore.currentProjectId = projectData.id;
        currentProjectId.value = projectData.id;
        await loadProjects();
      }
    } else {
      // 如果删除的不是当前项目，只需要从列表中移除
      projects.value = projects.value.filter((p) => p.id !== projectToDelete.value.id);
    }

    // 关闭删除确认对话框
    cancelDeleteProject();
  } catch (error) {
    console.error('删除项目失败:', error);
    alert('删除项目失败，请稍后重试');
  } finally {
    isDeleting.value = false;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  if (props.visible) {
    loadProjects();
  }
});
</script>

<style scoped>
.project-list-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.project-list-dialog {
  background-color: #2a2a2a;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 80vh;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 10000;
}

.project-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #3a3a3a;
}

.project-list-header h2 {
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

.project-list-body {
  padding: 20px;
  overflow-y: auto;
  max-height: 60vh;
  flex: 1;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message,
.empty-message {
  text-align: center;
  padding: 20px;
  color: #999;
}

.error-message {
  color: #ff6b6b;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.project-item {
  padding: 15px;
  border-radius: 6px;
  background-color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-item:hover {
  background-color: #444;
}

.project-item.active {
  background-color: #4a4a4a;
  border-left: 3px solid #0099ff;
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.project-name {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.project-name-input {
  background-color: #444;
  border: 1px solid #555;
  border-radius: 4px;
  color: white;
  font-size: 16px;
  padding: 5px 8px;
  width: 100%;
  outline: none;
}

.project-date {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.project-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 16px;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.edit-btn:hover {
  color: #0099ff;
  background-color: rgba(0, 153, 255, 0.1);
}

.delete-btn:hover {
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.1);
}

.save-btn:hover {
  color: #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
}

.cancel-btn:hover {
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.1);
}

.project-list-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #3a3a3a;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

/* 创建项目对话框 */
.create-project-dialog,
.delete-confirm-dialog {
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

.create-project-content,
.delete-confirm-content {
  background-color: #2a2a2a;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  padding: 20px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.create-project-content h3,
.delete-confirm-content h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #ccc;
}

.form-group input {
  width: 100%;
  padding: 10px;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #0099ff;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.dialog-actions button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
}

.dialog-actions .cancel-btn {
  background-color: #444;
  color: white;
}

.dialog-actions .confirm-btn {
  background-color: #0099ff;
  color: white;
}

.dialog-actions .delete-btn {
  background-color: #ff6b6b;
  color: white;
}

.dialog-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-confirm-content p {
  margin-bottom: 0;
  color: #ccc;
}
</style>
