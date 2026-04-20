import type { ReactNode } from 'react'
import { View } from 'react-native'
import { PublicNavbar } from '../components/navigations/PublicNavbar'

type PublicAppShellProps = {
  children: ReactNode
}

export function PublicAppShell({ children }: PublicAppShellProps) {
  return (
    <View className="flex-1 bg-surface">
      <PublicNavbar />
      <View className="flex-1 px-4">{children}</View>
    </View>
  )
}
