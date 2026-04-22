import { Stack } from 'expo-router'
import { Platform } from 'react-native'
import { materialColors } from '../../../src/theme/material'

export default function AuthenticatedContentLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        // header: () => <View><Text>gamer</Text></View>,
        headerShown: false,
        gestureEnabled: true,
        animation: Platform.OS === 'ios' ? 'default' : 'fade',
        ...(Platform.OS === 'ios' ? { fullScreenGestureEnabled: true } : {}),
        contentStyle: {
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 0,
          backgroundColor: materialColors.background,
        },
      }}
    >
      {/* Any route exposed in authenticated navbar must use animation: 'none'. */}
      <Stack.Screen name="dashboard/index" options={{ title: 'Dashboard', animation: 'none' }} />
      <Stack.Screen name="dashboard/details" options={{ title: 'Dashboard Details' }} />
      <Stack.Screen name="profile/index" options={{ title: 'Profile', animation: 'none' }} />
      <Stack.Screen name="menu" options={{ title: 'Menu', animation: 'none' }} />
      <Stack.Screen name="[module]/[model]/list" options={{ title: 'List' }} />
      <Stack.Screen name="[module]/[model]/create" options={{ title: 'Create' }} />
      <Stack.Screen name="[module]/[model]/detail/[id]" options={{ title: 'Detail' }} />
      <Stack.Screen name="[module]/[model]/update/[id]" options={{ title: 'Update' }} />
    </Stack>
  )
}
