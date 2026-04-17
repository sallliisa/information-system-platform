<script setup lang="ts">
import tasks from '@/app/configs/tasks'
import CRUDComposite from '@/components/composites/CRUDComposite.vue'
</script>

<template>
  <CRUDComposite :config="tasks"/>
</template>
