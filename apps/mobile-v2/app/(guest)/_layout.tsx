import { useEffect, useMemo } from 'react'
import { Redirect, Stack, usePathname } from 'expo-router'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { buildRouteRefreshKeyId } from '../../src/lib/route-refresh-key'
import { useSessionStatus } from '../../src/hooks/useSessionStatus'
import { DEFAULT_AUTH_ROUTE } from '../../src/lib/routes'
import { RefreshBoundary, removeRefreshKey } from '../../src/stores/keyManager'

export default function GuestLayout() {
  const status = useSessionStatus()
  const pathname = usePathname()
  const routeRefreshKeyId = useMemo(() => buildRouteRefreshKeyId(pathname || '/'), [pathname])

  useEffect(() => {
    return () => {
      removeRefreshKey(routeRefreshKeyId)
    }
  }, [routeRefreshKeyId])

  if (status === 'checking') {
    return <LoadingScreen />
  }

  if (status === 'authenticated') {
    return <Redirect href={DEFAULT_AUTH_ROUTE as any} />
  }

  return (
    <RefreshBoundary keyId={routeRefreshKeyId}>
      <Stack screenOptions={{ headerTitleAlign: 'center', animation: 'slide_from_right' }}>
        <Stack.Screen name="login" options={{ title: 'Login' }} />
      </Stack>
    </RefreshBoundary>
  )
}
