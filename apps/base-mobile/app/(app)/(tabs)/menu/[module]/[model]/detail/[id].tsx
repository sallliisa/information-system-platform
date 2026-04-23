import { useMemo } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { CRUDDetail } from '@/src/components/composites/CRUD'
import { ModelRouteNotFound } from '@/src/features/routes/ModelRouteNotFound'
import {
  buildUpdateHref,
  getCatalogEntry,
  getMobileRouteCatalog,
} from '@/src/features/routes/catalog.index'
import { pickRouteParam } from '@/src/features/routes/route-params'

export default function DynamicCRUDDetailRoute() {
  const router = useRouter()
  const params = useLocalSearchParams<Record<string, string | string[]>>()
  const moduleSlug = pickRouteParam(params, 'module')
  const modelSlug = pickRouteParam(params, 'model')
  const dataID = pickRouteParam(params, 'id')
  const catalog = useMemo(() => getMobileRouteCatalog(), [])

  const entry = useMemo(() => {
    if (!moduleSlug || !modelSlug) return undefined
    return getCatalogEntry(catalog, moduleSlug, modelSlug)
  }, [catalog, modelSlug, moduleSlug])

  if (!entry) {
    return <ModelRouteNotFound moduleSlug={moduleSlug} modelSlug={modelSlug} />
  }

  return (
    <CRUDDetail
      config={entry.config}
      dataID={dataID}
      onUpdate={() => {
        if (!dataID) return
        router.push(buildUpdateHref(entry, dataID) as any)
      }}
    />
  )
}
