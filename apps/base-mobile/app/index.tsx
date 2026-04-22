import { Redirect } from 'expo-router'
import { LoadingScreen } from '../src/components/LoadingScreen'
import { useSessionStatus } from '../src/hooks/useSessionStatus'
import { DEFAULT_AUTH_ROUTE, LOGIN_ROUTE } from '../src/lib/routes'

export default function IndexScreen() {
  const status = useSessionStatus()

  if (status === 'checking') {
    return <LoadingScreen />
  }

  return <Redirect href={(status === 'authenticated' ? DEFAULT_AUTH_ROUTE : LOGIN_ROUTE) as any} />
}
