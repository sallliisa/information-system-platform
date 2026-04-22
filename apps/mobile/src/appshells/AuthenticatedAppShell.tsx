import type { ReactNode } from 'react'
import { View } from 'react-native'
import { AuthenticatedBottomNavbar } from '../components/navigations/AuthenticatedBottomNavbar'
import { materialColors } from '../theme/material'

type AuthenticatedAppShellProps = {
  children: ReactNode
}

const ROOT_SURFACE_STYLE = {
  flex: 1,
  backgroundColor: materialColors.background,
  color: materialColors.onSurface,
}

export function AuthenticatedAppShell({ children }: AuthenticatedAppShellProps) {
  return (
    <View style={ROOT_SURFACE_STYLE as any}>
      <View style={{ flex: 1 }}>
        {children}
      </View>
      <View pointerEvents="box-none" className="absolute bottom-0 left-0 right-0 bg-transparent" style={{ backgroundColor: 'transparent' }}>
        <AuthenticatedBottomNavbar />
      </View>
    </View>
  )
}
