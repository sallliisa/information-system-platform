<script setup lang="ts">
import { ref, watch, type PropType } from 'vue'
import Button from '@repo/vue-framework/components/base/Button.vue'
import Card from '@repo/vue-framework/components/base/Card.vue'
import Icon from '@repo/vue-framework/components/base/Icon.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String as PropType<
      | 'primary'
      | 'secondary'
      | 'tertiary'
      | 'warning'
      | 'error'
      | 'info'
      | 'success'
      | 'primary-container'
      | 'secondary-container'
      | 'tertiary-container'
      | 'warning-container'
      | 'error-container'
      | 'info-container'
      | 'success-container'
      | 'surface-lowest'
      | 'surface-low'
      | 'surface'
      | 'surface-high'
      | 'surface-highest'
    >,
    default: 'surface',
  },
  unmount: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits<{ (e: 'update:isOpen', value: boolean): void }>()

const isOpen = ref<boolean>(props.isOpen)

watch(
  () => props.isOpen,
  (v) => {
    isOpen.value = v
  }
)
watch(isOpen, (v) => emit('update:isOpen', v))

function toggle() {
  isOpen.value = !isOpen.value
}

function setOpen(v: boolean) {
  isOpen.value = v
}
</script>

<template>
  <div class="flex flex-col">
    <Card :class="isOpen ? 'rounded-b-none' : ''" :color="color">
      <div class="flex items-center justify-between gap-2">
        <div class="min-w-0 flex-1">
          <slot name="preview" v-bind="{ isOpen, setOpen }"></slot>
        </div>
        <Button @click.stop="toggle" size="square" variant="icon">
          <Icon :name="isOpen ? 'arrow-up-s' : 'arrow-down-s'"></Icon>
        </Button>
      </div>
    </Card>
    <Card v-if="unmount ? isOpen : true" v-show="isOpen" class="rounded-t-none pt-0" :color="color">
      <slot name="content" v-bind="{ isOpen, setOpen }"></slot>
    </Card>
  </div>
</template>
