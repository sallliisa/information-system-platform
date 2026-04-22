import { useMemo } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { CRUDCreate } from '../../../../../src/components/composites/CRUD'
import { buildModuleModelKey, getMobileRouteCatalog } from '../../../../../src/features/routes/catalog.index'
import { ModelRouteNotFound } from '../../../../../src/features/routes/ModelRouteNotFound'
import { navigateBackOrFallback } from '../../../../../src/features/routes/navigation.policy'
import { pickRouteParam } from '../../../../../src/features/routes/route-params'

export default function DynamicCRUDCreateRoute() {
  const router = useRouter()
  const params = useLocalSearchParams<Record<string, string | string[]>>()
  const moduleSlug = pickRouteParam(params, 'module')
  const modelSlug = pickRouteParam(params, 'model')

  const entry = useMemo(() => {
    if (!moduleSlug || !modelSlug) return undefined
    return getMobileRouteCatalog().byModuleModel.get(buildModuleModelKey(moduleSlug, modelSlug))
  }, [moduleSlug, modelSlug])

  if (!entry) {
    return <ModelRouteNotFound moduleSlug={moduleSlug} modelSlug={modelSlug} />
  }

  return <CRUDCreate config={entry.config} onBack={() => navigateBackOrFallback(router as any, entry.hrefs.list)} />
}
