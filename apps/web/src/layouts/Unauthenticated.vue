<script setup lang="ts">
import LoginBackground from '@/assets/app/login/login-background.svg'
</script>

<template>
  <div class="flex max-h-screen min-h-screen w-full items-center justify-center bg-cover p-8" :style="{ backgroundImage: `url(${LoginBackground})` }">
    <div class="w-full max-w-screen-sm">
      <slot />
    </div>
  </div>
</template>
