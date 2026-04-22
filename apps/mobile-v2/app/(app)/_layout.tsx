import { useEffect, useMemo } from 'react'
import { Redirect, Stack, usePathname } from 'expo-router'
import { AuthenticatedAppShell } from '../../src/appshells/AuthenticatedAppShell'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { useSessionStatus } from '../../src/hooks/useSessionStatus'
import { buildRouteRefreshKeyId } from '../../src/lib/route-refresh-key'
import { LOGIN_ROUTE } from '../../src/lib/routes'
import { savePostLoginRedirect } from '../../src/lib/storage'
import { RefreshBoundary, removeRefreshKey } from '../../src/stores/keyManager'

export default function AppLayout() {
  const status = useSessionStatus()
  const pathname = usePathname()
  const routeRefreshKeyId = useMemo(() => buildRouteRefreshKeyId(pathname || '/'), [pathname])

  useEffect(() => {
    if (status === 'unauthenticated') {
      void savePostLoginRedirect(pathname || '/dashboard')
    }
  }, [pathname, status])

  useEffect(() => {
    return () => {
      removeRefreshKey(routeRefreshKeyId)
    }
  }, [routeRefreshKeyId])

  if (status === 'checking') {
    return <LoadingScreen />
  }

  if (status === 'unauthenticated') {
    return <Redirect href={LOGIN_ROUTE as any} />
  }

  return (
    <AuthenticatedAppShell>
      <RefreshBoundary keyId={routeRefreshKeyId}>
        <Stack screenOptions={{ headerShown: false }} />
      </RefreshBoundary>
    </AuthenticatedAppShell>
  )
}
