<script setup lang="ts">
import { computed } from 'vue'
import IframePreviewModal from '@repo/vue-framework/components/composites/IframePreviewModal.vue'
import { getFileExtension, isPreviewableExtension } from '@/utils/common'

const props = defineProps({
  file: Object,
})

const fileUrl = computed(() => {
  const file: any = props.file || {}
  return file?.url || file?.file_url || file?.file?.url || ''
})

const fileName = computed(() => {
  const file: any = props.file || {}
  return file?.filename || file?.name || file?.title || file?.document_number || file?.path?.split('/').pop() || ''
})

const isPreviewable = computed(() => {
  if (!props.file) return false
  const filename = fileName.value || (props.file as any)?.path || fileUrl.value || ''
  return isPreviewableExtension(getFileExtension(filename))
})
</script>

<template>
  <div v-if="file" class="flex flex-row items-center gap-2">
    <template v-if="fileUrl">
      <div class="flex flex-row gap-4">
        <a :href="fileUrl" target="_blank" class="cursor-pointer text-sm text-primary">Download <Icon name="download" size="sm"></Icon></a>
      </div>
      <template v-if="isPreviewable">
        <div class="h-[12px] w-[1px] bg-outline/[24%]"></div>
        <IframePreviewModal :url="fileUrl" :title="fileName">
          <template #trigger>
            <button target="_blank" class="cursor-pointer text-sm text-primary">Preview <Icon name="eye" size="sm"></Icon></button>
          </template>
        </IframePreviewModal>
      </template>
    </template>
  </div>
</template>
