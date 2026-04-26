import { Stack } from 'expo-router'
import { Platform } from 'react-native'
import { ActionControlsRouteScope, AppScreenScope } from '../../../../src/components/base'

export default function DashboardStackLayout() {
  return (
    <Stack
      screenLayout={({ children }) => (
        <ActionControlsRouteScope>
          <AppScreenScope>{children}</AppScreenScope>
        </ActionControlsRouteScope>
      )}
      screenOptions={{
        headerTitleAlign: 'center',
        headerShown: false,
        gestureEnabled: true,
        animation: Platform.OS === 'ios' ? 'default' : 'fade',
        ...(Platform.OS === 'ios' ? { fullScreenGestureEnabled: true } : {}),
      }}
    >
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="details" />
    </Stack>
  )
}
