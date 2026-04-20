<script setup lang="ts">
import services from '@/utils/services'

const props = defineProps({
  data: { type: Object, required: true },
})
</script>

<template>
  <div class="flex flex-col gap-8">
    <div v-for="formField in data" class="flex flex-col gap-2">
      <div class="flex flex-col gap-0">
        <p class="text-lg font-semibold">{{ formField.title }}</p>
        <p class="text-sm italic">{{ formField.subtitle }}</p>
      </div>
      <p v-html="formField.description"></p>
    </div>
  </div>
</template>
