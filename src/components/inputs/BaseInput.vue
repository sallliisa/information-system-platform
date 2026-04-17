<script setup lang="ts">
import { twMerge } from 'tailwind-merge'

const props = defineProps({
  error: {
    type: String,
    required: false,
    default: '',
  },
  label: {
    type: String,
    required: false,
    default: '',
  },
  helperMessage: {
    type: String,
    required: false,
    default: '',
  },
  enableHelperMessage: {
    type: Boolean,
    required: false,
    default: true,
  },
  required: {
    type: Boolean,
    required: false,
    default: false,
  },
})
</script>

<template>
  <div :class="`${twMerge(`flex flex-col gap-2`, $attrs.class as string)}`">
    <div>
      <label v-if="props.label" class="text-sm font-medium">
        <template v-if="!$slots.label">
          {{ props.label }}
          <span v-if="props.required" class="text-error">*</span>
        </template>
        <slot v-else name="label"></slot>
      </label>
      <div v-if="enableHelperMessage && (helperMessage || error)">
        <label v-if="helperMessage && !error" class="text-sm text-on-surface/[67%]">{{ helperMessage }}</label>
        <label v-else :class="`text-sm text-error `">{{ error }}</label>
      </div>
    </div>
    <slot></slot>
  </div>
</template>
