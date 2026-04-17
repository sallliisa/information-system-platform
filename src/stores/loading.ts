import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const value = ref({ global: false })

export const globalLoading = defineStore('loading', () => {
  function enable(name: string = 'global') {
    ;(value.value as any)[name] = true
  }
  function disable(name: string = 'global') {
    setTimeout(() => {
      ;(value.value as any)[name] = false
    }, 0)
  }
  function isLoading(name: string = 'global') {
    return (value.value as any)[name]
  }
  function refresh() {
    enable()
    setTimeout(() => {
      disable()
    }, 16)
  }
  return { value, enable, disable, isLoading, refresh }
})
