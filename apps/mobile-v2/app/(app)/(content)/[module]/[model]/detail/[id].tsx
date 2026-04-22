import { useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import type { ModelConfig } from '@repo/model-meta'
import { CRUDDetail } from '../../../../../../src/components/composites/CRUD/CRUDDetail'
import { AuthenticatedContent } from '../../../../../../src/components/layouts/AuthenticatedContent'
import { useCrudPermissions } from '../../../../../../src/hooks/useCrudPermissions'
import {
  buildUpdateHref,
  getCatalogEntry,
  getMobileRouteCatalog,
} from '../../../../../../src/features/routes/catalog.index'
import { ModelRouteForbidden } from '../../../../../../src/features/routes/ModelRouteForbidden'
import { ModelRouteNotFound } from '../../../../../../src/features/routes/ModelRouteNotFound'
import { navigateBackOrFallback } from '../../../../../../src/features/routes/navigation.policy'
import { pickRouteParam } from '../../../../../../src/features/routes/route-params'
import { hasPermissionKey } from '../../../../../../src/lib/route-access'
import { getPermissions } from '../../../../../../src/lib/storage'

const FALLBACK_MODEL_CONFIG: ModelConfig = {
  name: '__fallback__',
  title: '__fallback__',
}

export default function DynamicDetailRoute() {
  const router = useRouter()
  const params = useLocalSearchParams<Record<string, string | string[]>>()
  const moduleSlug = pickRouteParam(params, 'module')
  const modelSlug = pickRouteParam(params, 'model')
  const dataID = pickRouteParam(params, 'id')
  const [permissionPayload, setPermissionPayload] = useState<unknown>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const permissions = await getPermissions()
      if (!mounted) return
      setPermissionPayload(permissions)
    })()
    return () => {
      mounted = false
    }
  }, [])

  const entry = useMemo(() => {
    if (!moduleSlug || !modelSlug) return undefined
    return getCatalogEntry(getMobileRouteCatalog(), moduleSlug, modelSlug)
  }, [modelSlug, moduleSlug])
  const permissions = useCrudPermissions(entry?.config ?? FALLBACK_MODEL_CONFIG)

  if (!entry) {
    return <ModelRouteNotFound moduleSlug={moduleSlug} modelSlug={modelSlug} />
  }

  if (!hasPermissionKey(entry.permissionKey, permissionPayload)) {
    return <ModelRouteForbidden moduleSlug={moduleSlug} modelSlug={modelSlug} />
  }

  if (!permissions.view) return null

  return (
    <AuthenticatedContent>
      <CRUDDetail
        config={entry.config}
        permissions={permissions}
        dataID={dataID}
        onBack={() => navigateBackOrFallback(router as any, entry.hrefs.list)}
        onUpdate={() => {
          if (!dataID) return
          router.push(buildUpdateHref(entry, dataID) as any)
        }}
      />
    </AuthenticatedContent>
  )
}
