import { useMemo } from 'react'
import type { ModelConfig } from '@repo/model-meta'

export type CRUDPermissions = {
  view: boolean
  lookup: boolean
  detail: boolean
  create: boolean
  update: boolean
  delete: boolean
}

export function useCrudPermissions(_config: ModelConfig): CRUDPermissions {
  return useMemo(
    () => ({
      view: true,
      lookup: true,
      detail: true,
      create: true,
      update: true,
      delete: true,
    }),
    []
  )
}
