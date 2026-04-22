import { useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import type { ModelConfig } from '@repo/model-meta'
import { CRUDList } from '../../../../../src/components/composites/CRUD/CRUDList'
import { AuthenticatedContent } from '../../../../../src/components/layouts/AuthenticatedContent'
import { useCrudPermissions } from '../../../../../src/hooks/useCrudPermissions'
import {
  buildDetailHref,
  buildUpdateHref,
  getCatalogEntry,
  getMobileRouteCatalog,
} from '../../../../../src/features/routes/catalog.index'
import { ModelRouteForbidden } from '../../../../../src/features/routes/ModelRouteForbidden'
import { ModelRouteNotFound } from '../../../../../src/features/routes/ModelRouteNotFound'
import { pickRouteParam } from '../../../../../src/features/routes/route-params'
import { hasPermissionKey } from '../../../../../src/lib/route-access'
import { getPermissions } from '../../../../../src/lib/storage'

const FALLBACK_MODEL_CONFIG: ModelConfig = {
  name: '__fallback__',
  title: '__fallback__',
}

export default function DynamicListRoute() {
  const router = useRouter()
  const params = useLocalSearchParams<Record<string, string | string[]>>()
  const moduleSlug = pickRouteParam(params, 'module')
  const modelSlug = pickRouteParam(params, 'model')
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
      <CRUDList
        config={entry.config}
        permissions={permissions}
        onCreate={() => router.push(entry.hrefs.create as any)}
        onDetail={(id) => router.push(buildDetailHref(entry, id) as any)}
        onUpdate={(id) => router.push(buildUpdateHref(entry, id) as any)}
      />
    </AuthenticatedContent>
  )
}
