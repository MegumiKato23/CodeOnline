import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCompletionsStore = defineStore('completions', () => {
  const enabled = ref(true)
  const triggerChars = ref(['.', ':', '<', ' '])
  const externalLibraries = ref<string[]>([])

  const toggleEnabled = () => {
    enabled.value = !enabled.value
  }

  const loadLibrary = (lib: string, callback: (err: Error | null, data?: any) => void) => {
  if (!externalLibraries.value.includes(lib)) {
    fetch(`/completions/${lib}.json`)
      .then(res => res.json())
      .then(data => {
        externalLibraries.value.push(data);
        callback(null, data);
      })
      .catch(callback);
  } else {
    callback(null);
  }
};

  return { enabled, triggerChars, externalLibraries, toggleEnabled, loadLibrary }
})