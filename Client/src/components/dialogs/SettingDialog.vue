<template>
  <el-dialog v-if="internalVisible" title="Shipping address" width="500">
    <el-form :model="form">
      <el-form-item label="Promotion name" :label-width="formLabelWidth">
        <el-select v-model="form.region" placeholder="Please select a zone">
          <el-option label="Zone No.1" value="shanghai" />
          <el-option label="Zone No.2" value="beijing" />
        </el-select>
      </el-form-item>
      <el-form-item label="Zones" :label-width="formLabelWidth">
        <el-select v-model="form.region" placeholder="Please select a zone">
          <el-option label="Zone No.1" value="shanghai" />
          <el-option label="Zone No.2" value="beijing" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">Cancel</el-button>
        <el-button type="primary" @click="handleSettings">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
const props = defineProps<{
  dialogFormVisible: boolean;
}>();
// 新增内部响应式变量控制弹窗显示
const internalVisible = ref(props.dialogFormVisible)

// 监听 props 变化更新内部变量
watch(() => props.dialogFormVisible, (newVal) => {
  internalVisible.value = newVal
  console.log(internalVisible.value)
})
const emit = defineEmits(['closeDialog']);
const formLabelWidth = '140px'
const form = reactive({
  name: '',
  region: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})
const cancel = () => {
  console.log("cancle")
  emit('closeDialog')
}

const handleSettings = () => {
  console.log("handleSettings")
  emit('closeDialog')
}

</script>

