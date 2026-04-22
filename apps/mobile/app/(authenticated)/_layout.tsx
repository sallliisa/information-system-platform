import { useEffect, useMemo } from 'react'
import { Platform } from 'react-native'
import { Redirect, Stack, useGlobalSearchParams, usePathname } from 'expo-router'
import { AuthenticatedAppShell } from '../../src/appshells/AuthenticatedAppShell'
import { LoadingScreen } from '../../src/appshells/LoadingScreen'
import { useSessionStatus } from '../../src/hooks/useSessionStatus'
import { buildRouteRefreshKeyId } from '../../src/lib/route-refresh-key'
import { SYSTEM_LOGIN_ROUTE_ID, getRouteHref } from '../../src/lib/route-manifest'
import { savePostLoginRedirect } from '../../src/lib/storage'
import { RefreshBoundary, removeRefreshKey } from '../../src/stores/keyManager'

function buildInternalRoute(pathname: string, params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null) continue
    search.set(key, Array.isArray(value) ? String(value[0] ?? '') : String(value))
  }
  const queryString = search.toString()
  return queryString ? `${pathname}?${queryString}` : pathname
}

const authenticatedStackScreenOptions = {
  headerShown: false,
  gestureEnabled: true,
  animation: Platform.OS === 'ios' ? ('default' as const) : ('fade' as const),
  ...(Platform.OS === 'ios' ? { fullScreenGestureEnabled: true } : {}),
}

export default function AuthenticatedLayout() {
  const pathname = usePathname()
  const params = useGlobalSearchParams<Record<string, string | string[] | undefined>>()
  const status = useSessionStatus()
  const loginRoute = getRouteHref(SYSTEM_LOGIN_ROUTE_ID)
  const routeRefreshKeyId = useMemo(() => buildRouteRefreshKeyId(pathname || '/'), [pathname])

  const targetRoute = useMemo(() => buildInternalRoute(pathname || '/', params), [pathname, params])

  useEffect(() => {
    if (status === 'unauthenticated') {
      void savePostLoginRedirect(targetRoute)
    }
  }, [status, targetRoute])

  useEffect(() => {
    return () => {
      removeRefreshKey(routeRefreshKeyId)
    }
  }, [routeRefreshKeyId])

  if (status === 'checking') {
    return <LoadingScreen />
  }

  if (status === 'unauthenticated') {
    return <Redirect href={loginRoute as any} />
  }

  return (
    <AuthenticatedAppShell>
      <RefreshBoundary keyId={routeRefreshKeyId}>
        <Stack screenOptions={authenticatedStackScreenOptions} />
      </RefreshBoundary>
    </AuthenticatedAppShell>
  )
}
