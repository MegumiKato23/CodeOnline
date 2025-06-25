<template>
  <button :class="buttonClasses" :disabled="disabled" @click="handleClick" v-bind="$attrs">
    <!-- 图标插槽 -->
    <span v-if="$slots.icon || icon" class="btn-icon">
      <slot name="icon">
        <component :is="icon" v-if="icon" />
      </slot>
    </span>
    <!-- 文本插槽 -->
    <span v-if="$slots.default || text" class="btn-text">
      <slot>{{ text }}</slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  // 按钮类型：主要、标签页、透明按钮
  type?: 'primary' | 'tab' | 'ghost';
  // 按钮大小
  size?: 'large' | 'small';
  // 是否禁用
  disabled?: boolean;
  // 按钮图标
  icon?: any;
  // 按钮文本
  text?: string;
  //是否激活
  active?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'large',
  disabled: false,
  icon: null,
  active: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => [
  'unified-btn',
  `btn-${props.type}`,
  `btn-${props.size}`,
  {
    'btn-disabled': props.disabled,
    'btn-active': props.active,
  },
]);

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>

<style scoped>
.unified-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  font-family: inherit;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  outline: none;
  white-space: nowrap;
}

/* 尺寸变体 */
.btn-small {
  padding: 0.375rem 0.75rem;
  font-size: 0.7rem;
  min-height: 1rem;
  height: 1.5rem;
}

.btn-large {
  gap: 0.4rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.8rem;
  min-height: 2rem;
  height: 2.2rem;
}

/* 类型变体 */
.btn-primary {
  background: hsl(227.37deg 12.26% 30.39%);
  color: white;
  /* border: 1px solid#1a1a1a; */
}

.btn-primary:hover:not(.btn-disabled) {
  background: hsla(223, 33%, 96%, 0.705);
  /* border-color: #1a1a1a; */
}

.btn-tab {
  background: hsl(227.37deg 12.26% 30.39%);
  color: #fff;
  gap: 0.4rem;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.2rem;
}

.btn-tab:hover:not(.btn-disabled) {
  color: #fff;
  background: hsla(223, 33%, 96%, 0.705);
}

.btn-tab.btn-active {
  color: #fff;
  background: hsla(223, 33%, 96%, 0.639);

  /* border-bottom-color: #1a1a1a; */
}

/* 状态 */
.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 图标和文本 */
.btn-icon {
  display: flex;
  align-items: center;
  width: 1em;
  height: 1em;
  margin-bottom: -1px;
  flex-shrink: 0;
}
</style>
