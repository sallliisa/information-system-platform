import { Stack } from 'expo-router'
import { Platform } from 'react-native'
import { AppScreenScope } from '../../../../src/components/base'

export default function ProfileStackLayout() {
  return (
    <Stack
      screenLayout={({ children }) => <AppScreenScope>{children}</AppScreenScope>}
      screenOptions={{
        headerTitleAlign: 'center',
        headerShown: false,
        gestureEnabled: true,
        animation: Platform.OS === 'ios' ? 'default' : 'fade',
        ...(Platform.OS === 'ios' ? { fullScreenGestureEnabled: true } : {}),
      }}
    >
      <Stack.Screen name="index" options={{ animation: 'none' }} />
    </Stack>
  )
}
