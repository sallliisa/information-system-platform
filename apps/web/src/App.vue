<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { useScreenStore } from '@/stores/screen'
import { debounce } from '@/utils/common'
import { onMounted, onBeforeUnmount, defineAsyncComponent, computed, onErrorCaptured, ref } from 'vue'
import { useColorPreference } from './stores/colorpreference'
import { Toaster } from 'vue-sonner'
import { keyManager } from './stores/keyManager'
import config from './config'
import Spinner from '@southneuhof/is-vue-framework/components/base/Spinner.vue'

const error = ref<Error | null>(null)
onErrorCaptured((err, instance, info) => {
  console.error('App error:', err, instance, info)
  error.value = err
  return true
})

const handleResize = debounce(useScreenStore().handleResize, 300)

onMounted(() => {
  window.addEventListener('resize', handleResize)
  useScreenStore().handleResize()
  document.title = config.name
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const layoutMap: any = {
  DEFAULT: defineAsyncComponent(() => import('@/layouts/Authenticated.vue')),
  unauthenticated: defineAsyncComponent(() => import('@/layouts/Unauthenticated.vue')),
  public: defineAsyncComponent(() => import('@/layouts/PublicLayout.vue')),
  blank: defineAsyncComponent(() => import('@/layouts/Blank.vue')),
}

const route = useRoute()

const currentLocation = computed(() => {
  const path = route.path.split('/')[1]
  return path && layoutMap[path] ? path : 'DEFAULT'
})
</script>

<template>
  <div class="text-black-text transition-colors">
    <Toaster position="bottom-center" richColors :theme="useColorPreference().value" />
    <div class="flex h-full w-full items-center justify-center">
      <Suspense :timeout="0">
        <component :is="layoutMap[currentLocation]">
          <RouterView v-slot="{ Component }">
            <Transition name="vfade" mode="out-in" appear>
              <div v-if="Component" :key="`${$route.path}${String(keyManager().value[String($route.name)])}`">
                <Suspense :timeout="0">
                  <component :is="Component" />
                  <template #fallback>
                    <div class="flex items-center justify-center">
                      <Spinner />
                    </div>
                  </template>
                </Suspense>
              </div>
            </Transition>
          </RouterView>
        </component>
        <template #fallback>
          <div class="flex items-center justify-center">
            <Spinner />
          </div>
        </template>
      </Suspense>
    </div>
  </div>
</template>
