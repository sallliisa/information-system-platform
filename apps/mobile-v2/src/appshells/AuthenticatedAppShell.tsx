import type { ReactNode } from 'react'
import { View } from 'react-native'
import { AuthenticatedBottomNavbar } from '../components/navigations/AuthenticatedBottomNavbar'
import { materialColors } from '../theme/material'

type AuthenticatedAppShellProps = {
  children: ReactNode
}

export function AuthenticatedAppShell({ children }: AuthenticatedAppShellProps) {
  return (
    <View style={styles.root}>
      <View style={styles.content}>{children}</View>
      <View pointerEvents="box-none" style={styles.navbarOverlay}>
        <AuthenticatedBottomNavbar />
      </View>
    </View>
  )
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: materialColors.background,
  },
  content: {
    flex: 1,
  },
  navbarOverlay: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
  },
}
