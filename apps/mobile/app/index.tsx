import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { LoadingScreen } from '../src/appshells/LoadingScreen'
import { useSessionStatus } from '../src/hooks/useSessionStatus'
import { SYSTEM_LOGIN_ROUTE_ID, getRouteHref } from '../src/lib/route-manifest'
import { getPermissions } from '../src/lib/storage'
import { getDefaultPrivateRouteHref } from '../src/features/routes/catalog.index'

export default function Index() {
  const status = useSessionStatus()
  const [defaultPrivateRoute, setDefaultPrivateRoute] = useState<string | null>(null)
  const loginRoute = getRouteHref(SYSTEM_LOGIN_ROUTE_ID)

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

  return <Redirect href={loginRoute as any} />
}
