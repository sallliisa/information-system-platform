import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import app from '@/config'

let value: Set<string> = new Set()

export const permissions = defineStore('permissions', () => {
  function build(data: Array<string> = storage.localStorage.get('permissions')) {
    if (data?.length) value = new Set(data)
  }
  function has(permission: string) {
    if (app.mode === 'EARLY_DEVELOPMENT' || storage.localStorage.get('profile')?.role_id == 1 || !permission) return true
    return value.has(permission)
  }
  function clear() {
    return (value = new Set())
  }
  if (!value?.size) build()
  return { value, has, build, clear }
})
