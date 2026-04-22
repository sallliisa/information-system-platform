import { Redirect, Stack } from 'expo-router'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { useSessionStatus } from '../../src/hooks/useSessionStatus'
import { DEFAULT_AUTH_ROUTE } from '../../src/lib/routes'

export default function GuestLayout() {
  const status = useSessionStatus()

  if (status === 'checking') {
    return <LoadingScreen />
  }

  if (status === 'authenticated') {
    return <Redirect href={DEFAULT_AUTH_ROUTE as any} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  )
}
