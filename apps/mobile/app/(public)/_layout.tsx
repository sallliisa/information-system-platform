import { useEffect, useMemo } from 'react'
import { Slot, usePathname } from 'expo-router'
import { LoadingScreen } from '../../src/appshells/LoadingScreen'
import { PublicAppShell } from '../../src/appshells/PublicAppShell'
import { useSessionStatus } from '../../src/hooks/useSessionStatus'
import { buildRouteRefreshKeyId } from '../../src/lib/route-refresh-key'
import { RefreshBoundary, removeRefreshKey } from '../../src/stores/keyManager'

export default function PublicLayout() {
  const pathname = usePathname()
  const status = useSessionStatus()
  const routeRefreshKeyId = useMemo(() => buildRouteRefreshKeyId(pathname || '/'), [pathname])

  useEffect(() => {
    return () => {
      removeRefreshKey(routeRefreshKeyId)
    }
  }, [routeRefreshKeyId])

  if (status === 'checking') {
    return <LoadingScreen />
  }

  return (
    <PublicAppShell>
      <RefreshBoundary keyId={routeRefreshKeyId}>
        <Slot />
      </RefreshBoundary>
    </PublicAppShell>
  )
}
