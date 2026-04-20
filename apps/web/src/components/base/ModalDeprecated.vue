<script setup lang="ts">
import { ref, watch } from 'vue'
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogDescription, DialogTitle } from '@headlessui/vue'
import { twMerge } from 'tailwind-merge'

const emit = defineEmits(['update:isOpen'])
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: false,
    default: false,
  },
  onClose: {
    type: Function,
    required: false,
    default: () => null,
  },
  onOpen: {
    type: Function,
    required: false,
    default: () => null,
  },
  disabled: {
    type: Boolean,
    required: false,
  },
})

const isOpen = ref(props.isOpen)
const modelValue = defineModel<boolean>({ default: false })

function closeModal() {
  isOpen.value = false
  props.onClose()
}

function openModal() {
  props.onOpen()
  isOpen.value = true
}

watch(isOpen, (val) => {
  modelValue.value = isOpen.value
  emit('update:isOpen', val)
})

watch(
  () => props.isOpen,
  () => {
    isOpen.value = props.isOpen
  }
)
</script>

<template>
  <div @click="disabled ? null : openModal()" :class="twMerge('w-fit', $attrs.class as string)">
    <slot name="trigger" v-bind="{ openModal, disabled }"></slot>
  </div>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-10" id="dialog">
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-100 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-100 ease-in"
            leave-from="opacity-50 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <div class="fixed inset-0 overflow-y-auto">
              <div class="flex min-h-full items-center justify-center p-4">
                <DialogPanel class="w-full max-w-6xl transform rounded-3xl bg-surface-container p-6 text-left align-middle text-on-surface transition-all" :class="$attrs.class">
                  <div class="flex flex-col gap-4">
                    <DialogTitle v-if="$slots.title || $slots.icon" as="h3" class="flex w-full flex-col text-xl" :class="{ 'items-center justify-center gap-4': $slots.icon }">
                      <slot v-if="$slots.icon" name="icon"></slot>
                      <slot v-if="$slots.title" name="title" v-bind="{ closeModal }"></slot>
                    </DialogTitle>
                    <DialogDescription v-if="$slots.description" class="text-sm text-on-surface-variant">
                      <slot name="description"></slot>
                    </DialogDescription>
                    <div v-if="$slots.content" class="text-on-surface-variant">
                      <slot name="content" v-bind="{ closeModal }"></slot>
                    </div>

                    <div v-if="$slots.footer" class="flex flex-row items-center justify-end gap-2">
                      <slot name="footer" v-bind="{ closeModal }"></slot>
                    </div>
                  </div>
                </DialogPanel>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
