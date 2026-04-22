import { Redirect, Stack } from 'expo-router'
import { Platform } from 'react-native'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { useSessionStatus } from '../../src/hooks/useSessionStatus'
import { LOGIN_ROUTE } from '../../src/lib/routes'

export default function AppLayout() {
  const status = useSessionStatus()

  if (status === 'checking') {
    return <LoadingScreen />
  }

  if (status === 'unauthenticated') {
    return <Redirect href={LOGIN_ROUTE as any} />
  }

  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        gestureEnabled: true,
        animation: Platform.OS === 'ios' ? 'default' : 'fade',
        ...(Platform.OS === 'ios' ? { fullScreenGestureEnabled: true } : {}),
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'none' }} />
    </Stack>
  )
}
