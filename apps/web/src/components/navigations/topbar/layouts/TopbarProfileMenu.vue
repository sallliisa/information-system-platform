<script setup lang="ts">
import services from '@/utils/services'
import { defineAsyncComponent, ref } from 'vue'
import Card from '@southneuhof/is-vue-framework/components/base/Card.vue'

const { user: profile } = await services.get('me')

const tabConfig = [
  { name: 'Pengaturan Profil', component: defineAsyncComponent(() => import('./_layouts/ProfileSettings.vue')) },
  profile?.login_method != 'sso' ? { name: 'Ubah Password', component: defineAsyncComponent(() => import('./_layouts/ChangePassword.vue')) } : undefined,
  { name: 'Riwayat Gaji', component: defineAsyncComponent(() => import('./_layouts/SalaryHistory.vue')) },
  { name: 'Riwayat Presensi', component: defineAsyncComponent(() => import('./_layouts/PresencesMyList.vue')) },
  profile?.role_group_id == 30 || profile?.role_group_id == null || profile?.role_group_id == -1
    ? { name: 'Unit Kerja', component: defineAsyncComponent(() => import('./_layouts/Projects.vue')) }
    : undefined,
].filter((item) => !!item)
const activeTabIndex = ref(0)
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-xl font-semibold">Profil</p>
    <div class="relative grid grid-cols-4 gap-4">
      <div class="sticky top-0 col-span-1 flex flex-col gap-2 self-start">
        <Card interactive v-for="(menu, index) in tabConfig" @click="() => (activeTabIndex = index)" :color="activeTabIndex === index ? 'info-container' : 'surface'">{{ menu.name }}</Card>
      </div>
      <div class="col-span-3">
        <component v-if="activeTabIndex != null" :profile="profile" :is="tabConfig[activeTabIndex].component" />
      </div>
    </div>
  </div>
</template>
