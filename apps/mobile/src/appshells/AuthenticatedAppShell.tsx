import type { ReactNode } from 'react'
import { ScrollView, View } from 'react-native'
import { AuthenticatedBottomNavbar } from '../components/navigations/AuthenticatedBottomNavbar'
import { BottomOffsetProvider } from '../lib/bottom-offset'
import { useBottomAccessory, useBottomOffset } from '../hooks/useBottomOffset'
import { materialColors } from '../theme/material'

type AuthenticatedAppShellProps = {
  children: ReactNode
}

export function AuthenticatedAppShell({ children }: AuthenticatedAppShellProps) {
  return (
    <BottomOffsetProvider>
      <AuthenticatedAppShellContent>{children}</AuthenticatedAppShellContent>
    </BottomOffsetProvider>
  )
}

function AuthenticatedAppShellContent({ children }: AuthenticatedAppShellProps) {
  const totalBottomOffset = useBottomOffset()
  const bottomAccessory = useBottomAccessory()

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
      {bottomAccessory ? (
        <View
          pointerEvents="box-none"
          className="absolute left-4 right-4"
          style={{ bottom: bottomAccessory.bottom }}
        >
          {bottomAccessory.element}
        </View>
      ) : null}
      <AuthenticatedBottomNavbar />
    </View>
  )
}
