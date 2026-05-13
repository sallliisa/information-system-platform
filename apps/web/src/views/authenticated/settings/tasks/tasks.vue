<script setup lang="ts">
import tasks from '@client/data-model/models/web/tasks.model'
import CRUDComposite from '@repo/vue-framework/components/composites/CRUDComposite.vue'
</script>

<template>
  <CRUDComposite :config="tasks"/>
</template>
