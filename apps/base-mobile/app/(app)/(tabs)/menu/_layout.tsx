import { Stack } from 'expo-router'
import { Platform } from 'react-native'

export default function MenuStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        headerShown: false,
        gestureEnabled: true,
        animation: Platform.OS === 'ios' ? 'default' : 'fade',
        ...(Platform.OS === 'ios' ? { fullScreenGestureEnabled: true } : {}),
      }}
    >
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="[module]/[model]/index" />
      <Stack.Screen name="[module]/[model]/create" />
      <Stack.Screen name="[module]/[model]/detail/[id]" />
      <Stack.Screen name="[module]/[model]/update/[id]" />
    </Stack>
  )
}
