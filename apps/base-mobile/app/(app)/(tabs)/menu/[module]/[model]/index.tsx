import { useMemo } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAppScreenOptions } from '@/src/components/base'
import { CRUDList } from '@/src/components/composites/CRUD'
import { ModelRouteNotFound } from '@/src/features/routes/ModelRouteNotFound'
import {
  buildDetailHref,
  buildUpdateHref,
  getCatalogEntry,
  getMobileRouteCatalog,
} from '@/src/features/routes/catalog.index'
import { pickRouteParam } from '@/src/features/routes/route-params'

export default function DynamicCRUDListRoute() {
  useAppScreenOptions({ scrollable: false })

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

  return (
    <CRUDList
      config={entry.config}
      showHeading={false}
      onCreate={() => router.push(entry.hrefs.create as any)}
      onDetail={(id) => {
        if (id === undefined || id === null) return
        router.push(buildDetailHref(entry, id) as any)
      }}
      onUpdate={(id) => {
        if (id === undefined || id === null) return
        router.push(buildUpdateHref(entry, id) as any)
      }}
    />
  )
}
