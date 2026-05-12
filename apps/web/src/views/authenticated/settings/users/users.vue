<script setup lang="ts">
import users from '@repo/model-meta/models/users.model'
import CRUDComposite from '@repo/vue-framework/components/composites/CRUDComposite.vue'
import UsersMappingRole from './_layouts/UsersMappingRole.vue';
</script>

<template>
  <CRUDComposite :config="users">
    <template #detail-under>
      <UsersMappingRole/>
    </template>
  </CRUDComposite>
</template>
