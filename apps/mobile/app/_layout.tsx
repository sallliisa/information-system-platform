import '../global.css'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Platform } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RouteStackDebugOverlay } from '../src/components/debug/RouteStackDebugOverlay'

const rootStackScreenOptions = {
  headerShown: false,
  gestureEnabled: true,
  // ...(Platform.OS === 'ios' ? { fullScreenGestureEnabled: true } : {}),
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={rootStackScreenOptions} />
        <RouteStackDebugOverlay />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
