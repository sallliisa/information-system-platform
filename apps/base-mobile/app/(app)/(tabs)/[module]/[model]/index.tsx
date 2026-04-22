import { useMemo } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { CRUDList } from '../../../../../src/components/composites/CRUD'
import {
  buildCreateHref,
  buildDetailHref,
  buildModuleModelKey,
  buildUpdateHref,
  getMobileRouteCatalog,
} from '../../../../../src/features/routes/catalog.index'
import { ModelRouteNotFound } from '../../../../../src/features/routes/ModelRouteNotFound'
import { pickRouteParam } from '../../../../../src/features/routes/route-params'

export default function DynamicCRUDListRoute() {
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

  return (
    <CRUDList
      config={entry.config}
      onCreate={() => router.push(buildCreateHref(entry) as any)}
      onDetail={(id) => router.push(buildDetailHref(entry, id) as any)}
      onUpdate={(id) => router.push(buildUpdateHref(entry, id) as any)}
    />
  )
}
