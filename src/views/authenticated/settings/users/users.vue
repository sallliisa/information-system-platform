<script setup lang="ts">
import users from '@/app/configs/users'
import CRUDComposite from '@/components/composites/CRUDComposite.vue'
import UsersMappingRole from './_layouts/UsersMappingRole.vue';
</script>

<template>
  <CRUDComposite :config="users">
    <template #detail-under>
      <UsersMappingRole/>
    </template>
  </CRUDComposite>
</template>
