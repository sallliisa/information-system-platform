import { useMemo } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { CRUDDetail } from '../../../../../../src/components/composites/CRUD/CRUDDetail'
import { useCrudPermissions } from '../../../../../../src/hooks/useCrudPermissions'
import {
  buildModuleModelKey,
  buildUpdateHref,
  getMobileRouteCatalog,
} from '../../../../../../src/features/routes/catalog.index'
import { ModelRouteNotFound } from '../../../../../../src/features/routes/ModelRouteNotFound'
import { navigateBackOrFallback } from '../../../../../../src/features/routes/navigation.policy'
import { pickRouteParam } from '../../../../../../src/features/routes/route-params'

export default function DynamicCRUDDetailRoute() {
  const router = useRouter()
  const params = useLocalSearchParams<Record<string, string | string[]>>()
  const moduleSlug = pickRouteParam(params, 'module')
  const modelSlug = pickRouteParam(params, 'model')
  const dataID = pickRouteParam(params, 'id')

  const entry = useMemo(() => {
    if (!moduleSlug || !modelSlug) return undefined
    return getMobileRouteCatalog().byModuleModel.get(buildModuleModelKey(moduleSlug, modelSlug))
  }, [modelSlug, moduleSlug])

  if (!entry) {
    return <ModelRouteNotFound moduleSlug={moduleSlug} modelSlug={modelSlug} />
  }

  const permissions = useCrudPermissions(entry.config)
  if (!permissions.view) return null

  return (
    <CRUDDetail
      config={entry.config}
      permissions={permissions}
      dataID={dataID}
      onBack={() => navigateBackOrFallback(router, entry.hrefs.list)}
      onUpdate={() => {
        if (!dataID) return
        router.push(buildUpdateHref(entry, dataID) as any)
      }}
    />
  )
}
