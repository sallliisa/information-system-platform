<script setup lang="ts">
import { ref, type PropType } from 'vue'
import Modal from '../base/Modal.vue'
import Button from '@repo/vue-framework/components/base/Button.vue'

type ConfirmationHandler = (setOpen: (open: boolean) => void) => unknown | Promise<unknown>
type CancelHandler = () => unknown | Promise<unknown>

const props = defineProps({
  title: {
    type: String,
    required: false,
    default: 'Apakah anda yakin ingin melakukan aksi ini?',
  },
  message: {
    type: String,
    required: false,
    default: 'Tekan lanjut untuk melanjutkan aksi',
  },
  actions: {
    type: Array as PropType<Array<'y' | 'n'>>,
    required: false,
    default: () => ['y', 'n'],
  },
  confirmationButtonAppearance: {
    type: Object,
    required: false,
    default: () => ({
      y: {
        label: 'Lanjut',
        props: {
          color: 'primary',
          variant: 'icon',
        },
      },
      n: {
        label: 'Batal',
        props: {
          color: 'error',
          variant: 'filled',
        },
      },
    }),
  },
  onConfirm: {
    type: Function as PropType<ConfirmationHandler>,
    default: async () => {},
  },
  onCancel: {
    type: Function as PropType<CancelHandler>,
    default: async () => {},
  },
  data: {
    type: Object,
    required: false,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const isPending = ref(false)

async function handleAction(action: 'y' | 'n', setOpen: (open: boolean) => void) {
  if (isPending.value) return

  isPending.value = true
  try {
    if (action === 'y') {
      await Promise.resolve(props.onConfirm(setOpen))
    } else {
      await Promise.resolve(props.onCancel())
    }
    setOpen(false)
  } catch (error) {
    console.error(error)
  } finally {
    isPending.value = false
  }
}
</script>

<template>
  <slot v-if="disabled" name="trigger" v-bind="{ disabled }"></slot>
  <Modal v-else :class="[$attrs.class, { 'pointer-events-none': isPending }]">
    <template #trigger>
      <slot name="trigger" v-bind="{ disabled }"></slot>
    </template>
    <template #title>
      <slot name="title">{{ title }}</slot>
    </template>
    <template #icon v-if="$slots['icon']">
      <slot name="icon"></slot>
    </template>
    <template #description>
      <slot name="description">{{ message }}</slot>
    </template>
    <template #footer="{ setOpen }">
      <div class="flex w-full flex-row items-center justify-end gap-4">
        <Button v-for="action in actions" :disabled="isPending" v-bind="confirmationButtonAppearance[action].props" @click="handleAction(action, setOpen)">
          {{ confirmationButtonAppearance[action].label }}
        </Button>
      </div>
    </template>
  </Modal>
</template>
