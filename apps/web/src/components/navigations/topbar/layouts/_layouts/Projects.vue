<script setup lang="ts">
import Table from '@southneuhof/is-vue-framework/components/composites/Table.vue'
</script>

<template>
  <Table
    getAPI="projects"
    :fields="['division_id', 'name']"
    :fieldsAlias="{
      division_id: 'Divisi',
      name: 'Unit Kerja',
    }"
    :fieldsProxy="{
      division_id: 'rel_division_id_name',
    }"
    paginated
  />
</template>
