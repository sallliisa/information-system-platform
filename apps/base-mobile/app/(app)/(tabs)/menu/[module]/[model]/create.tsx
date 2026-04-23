import { useMemo } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { CRUDCreate } from '@/src/components/composites/CRUD'
import { ModelRouteNotFound } from '@/src/features/routes/ModelRouteNotFound'
import { getCatalogEntry, getMobileRouteCatalog } from '@/src/features/routes/catalog.index'
import { navigateBackOrFallback } from '@/src/features/routes/navigation.policy'
import { pickRouteParam } from '@/src/features/routes/route-params'

export default function DynamicCRUDCreateRoute() {
  const router = useRouter()
  const params = useLocalSearchParams<Record<string, string | string[]>>()
  const moduleSlug = pickRouteParam(params, 'module')
  const modelSlug = pickRouteParam(params, 'model')
  const catalog = useMemo(() => getMobileRouteCatalog(), [])

  const entry = useMemo(() => {
    if (!moduleSlug || !modelSlug) return undefined
    return getCatalogEntry(catalog, moduleSlug, modelSlug)
  }, [catalog, modelSlug, moduleSlug])

  if (!entry) {
    return <ModelRouteNotFound moduleSlug={moduleSlug} modelSlug={modelSlug} />
  }

  return <CRUDCreate config={entry.config} onBack={() => navigateBackOrFallback(router, entry.hrefs.list)} />
}
