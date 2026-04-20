<script setup lang="ts">
import tasks from '@repo/model-meta/models/tasks.model'
import CRUDComposite from '@/components/composites/CRUDComposite.vue'
</script>

<template>
  <CRUDComposite :config="tasks"/>
</template>
