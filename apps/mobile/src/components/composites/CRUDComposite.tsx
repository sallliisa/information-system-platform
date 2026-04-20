import { useCallback } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import type { ModelConfig } from '@repo/model-meta'
import { CRUDList } from './CRUD/CRUDList'
import { CRUDDetail } from './CRUD/CRUDDetail'
import { CRUDCreate } from './CRUD/CRUDCreate'
import { CRUDUpdate } from './CRUD/CRUDUpdate'
import { useCrudPermissions } from '../../hooks/useCrudPermissions'

type CRUDCompositeProps = {
  config: ModelConfig
}

type CRUDView = 'list' | 'detail' | 'create' | 'update'

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key]
  if (Array.isArray(value)) return value[0]
  return value
}

export function CRUDComposite({ config }: CRUDCompositeProps) {
  const router = useRouter()
  const params = useLocalSearchParams<Record<string, string | string[]>>()
  const permissions = useCrudPermissions(config)

  const viewKey = `${config.name}_view`
  const idKey = `${config.name}_id`
  const view = (readParam(params, viewKey) as CRUDView | undefined) || 'list'
  const dataID = readParam(params, idKey)

  const setView = useCallback(
    (nextView: CRUDView, id?: string | number) => {
      const nextParams: Record<string, string> = { [viewKey]: nextView }
      if (id !== undefined && id !== null) nextParams[idKey] = String(id)
      router.setParams(nextParams)
    },
    [idKey, router, viewKey]
  )

  if (!permissions.view) return null

  if (view === 'create') return <CRUDCreate config={config} onBack={() => setView('list')} />
  if (view === 'update') return <CRUDUpdate config={config} dataID={dataID} onBack={() => setView('list')} />
  if (view === 'detail') {
    return (
      <CRUDDetail
        config={config}
        permissions={permissions}
        dataID={dataID}
        onBack={() => setView('list')}
        onUpdate={() => setView('update', dataID)}
      />
    )
  }

  return (
    <CRUDList
      config={config}
      permissions={permissions}
      onCreate={() => setView('create')}
      onDetail={(id) => setView('detail', id)}
      onUpdate={(id) => setView('update', id)}
    />
  )
}
