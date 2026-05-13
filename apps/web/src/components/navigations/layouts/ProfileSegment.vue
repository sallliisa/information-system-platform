<script setup lang="ts">
import services from '@/utils/services'
import { useColorPreference } from '@/stores/colorpreference'
import { storage } from '@/utils/storage'
import Button from '@southneuhof/is-vue-framework/components/base/Button.vue'
import Icon from '@southneuhof/is-vue-framework/components/base/Icon.vue'

const profileData = storage.localStorage.get('profile')
</script>

<template>
  <div class="flex h-full flex-col justify-between">
    <div class="flex flex-col gap-8">
      <div class="flex flex-col gap-2">
        <div class="flex flex-row items-center justify-between gap-4">
          <div>
            <p class="text-lg font-semibold">{{ profileData.fullname }}</p>
            <p class="text-sm text-muted">{{ profileData.username }}</p>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <div class="flex w-full flex-row items-center justify-between">
          <div>Mode Tampilan</div>
          <Button variant="icon" color="primary" size="square" @click="useColorPreference().toggle()"><Icon :name="useColorPreference().value == 'dark' ? 'sun' : 'moon'" /></Button>
        </div>
        <div class="flex flex-row items-center gap-2">
          <Button @click="services.signOut()" class="w-full" variant="tonal" color="error"><Icon name="logout-box" />Keluar</Button>
        </div>
      </div>
    </div>
  </div>
</template>
