import { Redirect, Slot } from 'expo-router'
import { LoadingScreen } from '../../src/appshells/LoadingScreen'
import { UnauthenticatedAppShell } from '../../src/appshells/UnauthenticatedAppShell'
import { useSessionStatus } from '../../src/hooks/useSessionStatus'
import { DEFAULT_APP_PRIVATE_ROUTE_ID, getRouteHref } from '../../src/lib/route-manifest'

export default function UnauthenticatedLayout() {
  const status = useSessionStatus()
  const defaultPrivateRoute = getRouteHref(DEFAULT_APP_PRIVATE_ROUTE_ID)

  if (status === 'checking') {
    return <LoadingScreen />
  }

  if (status === 'authenticated') {
    return <Redirect href={defaultPrivateRoute as any} />
  }

  return (
    <UnauthenticatedAppShell>
      <Slot />
    </UnauthenticatedAppShell>
  )
}
