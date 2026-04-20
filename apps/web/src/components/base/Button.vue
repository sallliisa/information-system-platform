<script setup lang="ts">
import { twMerge } from 'tailwind-merge'
import type { PropType } from 'vue'

const props = defineProps({
  variant: {
    type: String as PropType<'filled' | 'outlined' | 'tonal' | 'icon'>,
    required: false,
    default: 'filled',
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  color: {
    type: String as PropType<'primary' | 'secondary' | 'tertiary' | 'warning' | 'error' | 'info' | 'success'>,
    default: 'primary',
  },
  size: {
    type: String as PropType<'square' | 'full'>,
    required: false,
    default: 'full',
  },
  type: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    required: false,
    default: 'button',
  },
})

const colorMap = {
  filled: {
    base: 'inline-flex items-center justify-center gap-2 disabled:bg-on-surface/[12%] disabled:text-on-surface/[38%]  ',
    primary: 'bg-primary after:bg-on-primary/[8%]   text-on-primary ',
    secondary: 'bg-secondary after:bg-on-secondary/[8%]   text-on-secondary ',
    tertiary: 'bg-tertiary after:bg-on-tertiary/[8%]   text-on-tertiary ',
    warning: 'bg-warning after:bg-on-warning/[8%]   text-on-warning ',
    error: 'bg-error after:bg-on-error/[8%]   text-on-error ',
    info: 'bg-info after:bg-on-info/[8%]   text-on-info ',
    success: 'bg-success after:bg-on-success/[8%]   text-on-success ',
  },
  tonal: {
    base: 'disabled:text-black-light  inline-flex cursor-pointer justify-center gap-2 focus:outline-none disabled:cursor-default disabled:bg-on-surface/[12%] disabled:text-on-surface/[38%]  ',
    primary: 'bg-primary-container after:hover:bg-on-primary-container/[8%]  after:active:bg-on-primary-container/[12%]   text-on-primary-container ',
    secondary: 'bg-secondary-container after:hover:bg-on-secondary-container/[8%]  after:active:bg-on-secondary-container/[12%]   text-on-secondary-container ',
    tertiary: 'bg-tertiary-container after:hover:bg-on-tertiary-container/[8%]  after:active:bg-on-tertiary-container/[12%]   text-on-tertiary-container ',
    info: 'bg-info-container after:hover:bg-on-info-container/[8%] after:active:bg-on-info-container/[12%] text-on-info-container ',
    warning: 'bg-warning-container after:hover:bg-on-warning-container/[8%]  after:active:bg-on-warning-container/[12%]   text-on-warning-container ',
    error: 'bg-error-container after:hover:bg-on-error-container/[8%]  after:active:bg-on-error-container/[12%]   text-on-error-container ',
    success: 'bg-success-container after:hover:bg-on-success-container/[8%]  after:active:bg-on-success-container/[12%]   text-on-success-container ',
  },
  outlined: {
    base: 'font-medium disabled:text-on-surface/[38%]  outline outline-1 disabled:outline-on-surface/[12%]  inline-flex justify-center gap-2',
    primary: 'after:hover:bg-on-primary-container/[8%]  outline-primary  after:active:bg-on-primary-container/[12%]  disabled:bg-on-surface/[12%] disabled:text-on-surface/[38%]   text-primary  ',
    secondary:
      'after:hover:bg-on-secondary-container/[8%]  outline-secondary  after:active:bg-on-secondary-container/[12%]  disabled:bg-on-surface/[12%] disabled:text-on-surface/[38%]   text-secondary  ',
    tertiary: 'after:hover:bg-on-tertiary-container/[8%]  outline-tertiary  after:active:bg-on-tertiary-container/[12%]  disabled:bg-on-surface/[12%] disabled:text-on-surface/[38%]   text-tertiary  ',
    info: 'after:hover:bg-on-info-container/[8%]  outline-info  after:active:bg-on-info-container/[12%]  disabled:bg-on-surface/[12%] disabled:text-on-surface/[38%]   text-info  ',
    warning: 'after:hover:bg-on-warning-container/[8%]  outline-warning  after:active:bg-on-warning-container/[12%]  disabled:bg-on-surface/[12%] disabled:text-on-surface/[38%]   text-warning  ',
    error: 'after:hover:bg-on-error-container/[8%]  outline-error  after:active:bg-on-error-container/[12%]  disabled:bg-on-surface/[12%] disabled:text-on-surface/[38%]   text-error  ',
    success: 'after:hover:bg-on-success-container/[8%]  outline-success  after:active:bg-on-success-container/[12%]  disabled:bg-on-surface/[12%] disabled:text-on-surface/[38%]   text-success  ',
  },
  text: {
    base: 'font-medium disabled:text-on-surface/[38%] ',
    primary: 'after:hover:bg-on-primary-container/[8%]  after:active:bg-on-primary-container/[12%]  disabled:bg-on-surface/[12%] disabled:text-on-surface/[38%]   text-primary ',
    secondary: 'after:hover:bg-on-secondary-container/[8%]  after:active:bg-on-secondary-container/[12%]  disabled:bg-on-surface/[12%] disabled:text-on-surface/[38%]   text-secondary ',
    tertiary: 'after:hover:bg-on-tertiary-container/[8%]  after:active:bg-on-tertiary-container/[12%]  disabled:bg-on-surface/[12%] disabled:text-on-surface/[38%]   text-tertiary ',
    info: 'after:hover:bg-on-info-container/[8%]  after:active:bg-on-info-container/[12%]  text-info ',
    warning: 'after:hover:bg-on-warning-container/[8%]  after:active:bg-on-warning-container/[12%]  text-warning ',
    error: 'after:hover:bg-on-error-container/[8%]  after:active:bg-on-error-container/[12%]  text-error ',
    success: 'after:hover:bg-on-success-container/[8%]  after:active:bg-on-success-container/[12%]  text-success ',
  },
  icon: {
    base: 'disabled:text-black-light  inline-flex cursor-pointer justify-center gap-2 focus:outline-none disabled:cursor-default disabled:text-on-surface/[38%] ',
    primary: 'after:hover:bg-on-primary-container/[8%]  after:active:bg-on-primary-container/[12%]  disabled:bg-on-surface/[12%] disabled:text-on-surface/[38%]   text-primary ',
    secondary: 'after:hover:bg-on-secondary-container/[8%]  after:active:bg-on-secondary-container/[12%]  disabled:bg-on-surface/[12%] disabled:text-on-surface/[38%]   text-secondary ',
    tertiary: 'after:hover:bg-on-tertiary-container/[8%]  after:active:bg-on-tertiary-container/[12%]  disabled:bg-on-surface/[12%] disabled:text-on-surface/[38%]   text-tertiary ',
    info: 'after:hover:bg-on-info-container/[8%]  after:active:bg-on-info-container/[12%]  text-info ',
    warning: 'after:hover:bg-on-warning-container/[8%]  after:active:bg-on-warning-container/[12%]  text-warning ',
    error: 'after:hover:bg-on-error-container/[8%]  after:active:bg-on-error-container/[12%]  text-error ',
    success: 'after:hover:bg-on-success-container/[8%]  after:active:bg-on-success-container/[12%]  text-success ',
  },
}

const sizeMap = {
  square: 'aspect-square p-2',
  full: 'px-6 py-2',
}
</script>

<template>
  <button
    class="overlay flex items-center justify-center rounded-full disabled:pointer-events-none"
    :type="props.type"
    :disabled="props.disabled"
    :class="`${twMerge(colorMap[props.variant][props.color], $attrs?.class as string)} ${sizeMap[props.size]} ${colorMap[props.variant].base}`"
  >
    <slot></slot>
  </button>
</template>
