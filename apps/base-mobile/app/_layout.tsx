import '../global.css'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Toaster } from 'sonner-native'
import { MaterialThemeProvider, useMaterialTheme } from '../src/theme'

function GlobalToaster() {
  const { scheme } = useMaterialTheme()

  return <Toaster position="bottom-center" richColors theme={scheme === 'dark' ? 'dark' : 'light'} />
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <MaterialThemeProvider>
          <BottomSheetModalProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(guest)" />
              <Stack.Screen name="(app)" />
            </Stack>
            <GlobalToaster />
          </BottomSheetModalProvider>
        </MaterialThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
