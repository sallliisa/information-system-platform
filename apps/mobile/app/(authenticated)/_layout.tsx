import { useEffect, useMemo } from 'react'
import { Redirect, Slot, useGlobalSearchParams, usePathname } from 'expo-router'
import { AuthenticatedAppShell } from '../../src/appshells/AuthenticatedAppShell'
import { LoadingScreen } from '../../src/appshells/LoadingScreen'
import { useSessionStatus } from '../../src/hooks/useSessionStatus'
import { SYSTEM_LOGIN_ROUTE_ID, getRouteHref } from '../../src/lib/route-manifest'
import { savePostLoginRedirect } from '../../src/lib/storage'

function buildInternalRoute(pathname: string, params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null) continue
    search.set(key, Array.isArray(value) ? String(value[0] ?? '') : String(value))
  }
  const queryString = search.toString()
  return queryString ? `${pathname}?${queryString}` : pathname
}

export default function AuthenticatedLayout() {
  const pathname = usePathname()
  const params = useGlobalSearchParams<Record<string, string | string[] | undefined>>()
  const status = useSessionStatus()
  const loginRoute = getRouteHref(SYSTEM_LOGIN_ROUTE_ID)

  const targetRoute = useMemo(() => buildInternalRoute(pathname || '/', params), [pathname, params])

  useEffect(() => {
    if (status === 'unauthenticated') {
      void savePostLoginRedirect(targetRoute)
    }
  }, [status, targetRoute])

  if (status === 'checking') {
    return <LoadingScreen />
  }

  if (status === 'unauthenticated') {
    return <Redirect href={loginRoute as any} />
  }

  return (
    <AuthenticatedAppShell>
      <Slot />
    </AuthenticatedAppShell>
  )
}
