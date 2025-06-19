<!-- <template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>General Settings</DialogTitle>
        <DialogDescription>
          Customize General Settings for a creative coding experience! 😊🎨
        </DialogDescription>
      </DialogHeader>

      <div class="settings-content">
        <div class="settings-row">
          <div class="switch-item">
            <Label for="auto-save">Auto Save:</Label>
            <Switch
              v-model="autoSave"
              id="auto-save"
            />
          </div>
          <div class="switch-item">
            <Label for="word-wrap">Word Wrap:</Label>
            <Switch
              v-model="wordWrap"
              id="word-wrap"
            />
          </div>
        </div>

        <div class="settings-group">
          <div class="input-item">
            <Label for="classes">Add Classes to &lt;html&gt;:</Label>
            <Input
              v-model="htmlClasses"
              type="text"
              id="classes"
              placeholder="classes"
            />
          </div>

          <div class="input-item">
            <Label for="font-size">Font Size:</Label>
            <Input
              v-model.number="fontSize"
              type="number"
              id="font-size"
            />
          </div>

          <div class="input-item">
            <Label for="title">Title</Label>
            <Input
              v-model="metatags.title"
              type="text"
              id="title"
              placeholder="title"
            />
          </div>

          <div class="input-item">
            <Label for="description">Description</Label>
            <Textarea
              v-model="metatags.description"
              id="description"
              placeholder="description"
            />
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/Settings.store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const settingsStore = useSettingsStore()
const open = ref(false)

// 使用 storeToRefs 保持响应式
const {
  autoSave,
  wordWrap,
  htmlClasses,
  fontSize,
  metatags
} = storeToRefs(settingsStore)

// 处理 metaTags 的更新
const updateMetaTag = (value: string, field: 'title' | 'description') => {
  settingsStore.setMetaTags(value, field)
}
</script>

<style scoped>
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.switch-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style> -->