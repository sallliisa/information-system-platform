<script setup lang="ts">
import roles from '@repo/model-meta/models/roles.model'
import ConfirmationModal from '@/components/composites/ConfirmationModal.vue'
import CRUDComposite from '@/components/composites/CRUDComposite.vue'
import { syncModel } from '@/utils/projectcommons/model'
import RolesDetailUnder from './_layouts/RolesDetailUnder.vue'
import { keyManager } from '@/stores/keyManager'
</script>

<template>
  <CRUDComposite :config="roles">
    <template #detail-under="{ data }">
      <div class="flex flex-col gap-2">
        <RolesDetailUnder :key="keyManager().value['roles-detail-under']" />
      </div>
    </template>
  </CRUDComposite>
</template>
