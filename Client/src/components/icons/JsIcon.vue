<template>
  <svg class="file-type-icon" viewBox="0 0 15 15" width="1em" height="1em" v-bind="$attrs">
    <rect width="15" height="15" fill="#FCD000" rx="4" />
    <path
      fill="#282828"
      d="M6.554 3.705a.55.55 0 0 1-.452.543c-1.2.217-2.12 1.61-2.12 3.275 0 1.665.92 3.057 2.12 3.274a.554.554 0 0 1-.205 1.087c-1.733-.322-3.022-2.175-3.022-4.361 0-2.187 1.289-4.04 3.022-4.362a.554.554 0 0 1 .657.544zm1.892 0c0-.347.316-.607.657-.544 1.733.322 3.022 2.175 3.022 4.362 0 2.186-1.289 4.04-3.022 4.361a.554.554 0 0 1-.205-1.087c1.2-.217 2.12-1.61 2.12-3.274 0-1.665-.92-3.058-2.12-3.275a.551.551 0 0 1-.452-.543z"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'JSIcon',
  inheritAttrs: false,
});
</script>

<style scoped>
.file-type-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
