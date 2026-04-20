<script setup lang="ts">
import LoginBackground from '@/assets/app/login/login-background.svg'
import { useRouter } from 'vue-router'
import services from '@/utils/services'
import { modules } from '@/stores/modules'
import { storage } from '@/utils/storage'
import _app from '@/app/configs/_app'

const router = useRouter()

if (storage.cookie.get('token')) {
  console.log('has token tried to access unauthenticated. authenticating')
  try {
    const firstRoute = modules().value[0]?.routes.find((x: any) => !x.separator)
    if (firstRoute) router.push({ name: firstRoute.name })
  } catch (err) {
    services.signOut()
    router.push({ name: 'login' })
  }
}
</script>

<template>
  <div class="flex max-h-screen min-h-screen w-full items-center justify-center bg-cover p-8" :style="{ backgroundImage: `url(${LoginBackground})` }">
    <div class="w-full max-w-screen-sm">
      <slot />
    </div>
  </div>
</template>
