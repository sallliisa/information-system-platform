import type { ReactNode } from 'react'
import { ScrollView, View } from 'react-native'
import { AuthenticatedBottomNavbar } from '../components/navigations/AuthenticatedBottomNavbar'
import { AccessoryProvider } from '../lib/bottom-offset'
import { useBottomOffset } from '../hooks/useBottomOffset'
import { materialColors } from '../theme/material'

type AuthenticatedAppShellProps = {
  children: ReactNode
}

export function AuthenticatedAppShell({ children }: AuthenticatedAppShellProps) {
  return (
    <AccessoryProvider>
      <AuthenticatedAppShellContent>{children}</AuthenticatedAppShellContent>
    </AccessoryProvider>
  )
}

function AuthenticatedAppShellContent({ children }: AuthenticatedAppShellProps) {
  const totalBottomOffset = useBottomOffset()

  return (
    <View style={{ flex: 1, backgroundColor: materialColors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: totalBottomOffset,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      <AuthenticatedBottomNavbar />
    </View>
  )
}
