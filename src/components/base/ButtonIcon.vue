<script setup lang="ts">
const props = defineProps({
  secondary: {
    type: Boolean,
    required: false,
    default: false,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
})
</script>

<template>
  <button
    :class="secondary ? 'bg-surface-variant fill-primary hover:bg-on-surface-variant/[8%]   ' : 'hover:bg-primary-hover bg-primary fill-white'"
    class="flex h-9 w-9 items-center justify-center rounded-full p-4"
  >
    <slot></slot>
  </button>
</template>
