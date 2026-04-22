import { useEffect, useMemo, useState } from 'react'
import { Redirect, Slot, usePathname } from 'expo-router'
import { LoadingScreen } from '../../src/appshells/LoadingScreen'
import { UnauthenticatedAppShell } from '../../src/appshells/UnauthenticatedAppShell'
import { useSessionStatus } from '../../src/hooks/useSessionStatus'
import { buildRouteRefreshKeyId } from '../../src/lib/route-refresh-key'
import { getPermissions } from '../../src/lib/storage'
import { RefreshBoundary, removeRefreshKey } from '../../src/stores/keyManager'
import { getDefaultPrivateRouteHref } from '../../src/features/routes/catalog.index'

export default function UnauthenticatedLayout() {
  const pathname = usePathname()
  const status = useSessionStatus()
  const [defaultPrivateRoute, setDefaultPrivateRoute] = useState<string | null>(null)
  const routeRefreshKeyId = useMemo(() => buildRouteRefreshKeyId(pathname || '/'), [pathname])

  useEffect(() => {
    return () => {
      removeRefreshKey(routeRefreshKeyId)
    }
  }, [routeRefreshKeyId])

  useEffect(() => {
    let mounted = true
    if (status !== 'authenticated') {
      setDefaultPrivateRoute(null)
      return () => {
        mounted = false
      }
    }

    ;(async () => {
      const permissions = await getPermissions()
      if (!mounted) return
      setDefaultPrivateRoute(getDefaultPrivateRouteHref(permissions))
    })()

    return () => {
      mounted = false
    }
  }, [status])

  if (status === 'checking') {
    return <LoadingScreen />
  }

  if (status === 'authenticated') {
    if (!defaultPrivateRoute) return <LoadingScreen />
    return <Redirect href={defaultPrivateRoute as any} />
  }

  return (
    <UnauthenticatedAppShell>
      <RefreshBoundary keyId={routeRefreshKeyId}>
        <Slot />
      </RefreshBoundary>
    </UnauthenticatedAppShell>
  )
}
