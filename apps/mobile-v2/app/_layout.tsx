import { Stack } from 'expo-router'
import { MaterialThemeProvider } from '../src/theme'

export default function RootLayout() {
  return (
    <MaterialThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(guest)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </MaterialThemeProvider>
  )
}
