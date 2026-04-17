import { ref } from 'vue'
import { defineStore } from 'pinia'

export const appConfig = defineStore('appConfig', () => {
  const config = ref<Record<string, any>>({})

  return { config }
})
