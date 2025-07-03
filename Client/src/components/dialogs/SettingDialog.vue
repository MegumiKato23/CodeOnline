<template>
  <div class="custom-dialog" v-if="internalVisible">
    <div class="dialog-header">
      <h2>Settings</h2>
      <button class="close-btn" @click="cancel">×</button>
    </div>
    <div class="dialog-body">
      <div class="form-group">
        <label for="region1">Framework</label>
        <el-select v-model="form.framework" id="region1" placeholder="请选择">
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
      <button class="cancel-btn" @click="cancel">Cancel</button>
      <button class="confirm-btn" @click="handleSettings">Confirm</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
const props = defineProps<{ 
  dialogFormVisible: boolean; 
}>();  

const internalVisible = ref(props.dialogFormVisible);

watch(() => props.dialogFormVisible, (newVal) => {
  internalVisible.value = newVal;
});

const emit = defineEmits(['closeDialog','updateSettings']);
const form = reactive({
  framework:'',
  syntax:''
});

const cancel = () => { 
  console.log("cancel") 
  emit('closeDialog') 
} 

const handleSettings = () => { 
  emit('updateSettings', form.framework, form.syntax);
  emit('closeDialog') 
} 
</script>

<style scoped>
.custom-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h2 {
  margin: 0;
  font-size: 18px;
  color:black;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
  color:black;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.dialog-footer {
  padding: 10px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
}

.confirm-btn {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.confirm-btn:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.cancel-btn:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}
</style>

