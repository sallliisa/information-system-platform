<script setup lang="ts">
import Form from '@repo/vue-framework/components/composites/Form.vue'
import { keyManager } from '@/stores/keyManager'
import { toast } from 'vue-sonner'
</script>

<template>
  <Form
    :key="keyManager().value['user-menu-change-password']"
    :fields="['old_password', 'new_password']"
    :fieldsAlias="{
      old_password: 'Password Lama',
      new_password: 'Password Baru',
    }"
    :inputConfig="{
      old_password: { type: 'password', props: { required: true } },
      new_password: { type: 'password', props: { required: true } },
    }"
    targetAPI="change-password?custom"
    :onSuccess="
      () => {
        toast.success('Berhasil mengubah password!')
        keyManager().triggerChange('user-menu-change-password')
      }
    "
  />
</template>
