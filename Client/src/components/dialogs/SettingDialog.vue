<template>
  <div class="custom-overlay" v-if="internalVisible">
    <div class="custom-dialog">
    <div class="dialog-header">
      <h2>Settings</h2>
      <button class="close-btn" @click="cancel">×</button>
    </div>
    <div class="dialog-body">
      <div class="form-group">
        <label for="region1">Framework</label>
        <el-select v-model="form.framework" id="region1"  placeholder="请选择">
          <el-option label="Vue" value="vue" />
          <el-option label="React" value="react" />
        </el-select>
      </div>
      <div class="form-group">
        <label for="region2">Syntax in CSS</label>
        <el-select v-model="form.syntax" id="region2" placeholder="请选择">
          <el-option label="Sass" value="sass" />
          <el-option label="Less" value="less" />
        </el-select>
      </div>
    </div>
    <div class="dialog-footer">
      <button class=" btn cancel-btn" @click="cancel">Cancel</button>
      <button class=" btn confirm-btn" @click="handleSettings">Confirm</button>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
const props = defineProps<{
  dialogFormVisible: boolean;
}>();

const internalVisible = ref(props.dialogFormVisible);

watch(
  () => props.dialogFormVisible,
  (newVal) => {
    internalVisible.value = newVal;
  }
);

const emit = defineEmits(['closeDialog', 'updateSettings']);
const form = reactive({
  framework: '',
  syntax: '',
});

const cancel = () => {
  console.log('cancel');
  emit('closeDialog');
};

const handleSettings = () => {
  emit('updateSettings', form.framework, form.syntax);
  emit('closeDialog');
};
</script>

<style scoped>
.custom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.custom-dialog {
  background-color: #2a2a2a;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h2 {
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

.dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #ccc;
}


.dialog-footer {
  display: flex;
  justify-content: space-between;
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

.cancel-btn{
  background-color: transparent;
  color: #ccc;
  border: 1px solid #555;
}

.confirm-btn {
  background-color: #409eff;
  color: white;
}

.confirm-btn:hover {
  background-color: #66b1ff;
}

</style>
