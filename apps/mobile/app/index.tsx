import { Redirect } from 'expo-router'
import { LoadingScreen } from '../src/appshells/LoadingScreen'
import { useSessionStatus } from '../src/hooks/useSessionStatus'
import { DEFAULT_APP_PRIVATE_ROUTE_ID, SYSTEM_LOGIN_ROUTE_ID, getRouteHref } from '../src/lib/route-manifest'

export default function Index() {
  const status = useSessionStatus()
  const defaultPrivateRoute = getRouteHref(DEFAULT_APP_PRIVATE_ROUTE_ID)
  const loginRoute = getRouteHref(SYSTEM_LOGIN_ROUTE_ID)

  if (status === 'checking') {
    return <LoadingScreen />
  }

  if (status === 'authenticated') {
    return <Redirect href={defaultPrivateRoute as any} />
  }

  return <Redirect href={loginRoute as any} />
}
