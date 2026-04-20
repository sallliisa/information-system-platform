import type { ReactNode } from 'react'
import { View } from 'react-native'

type UnauthenticatedAppShellProps = {
  children: ReactNode
}

export function UnauthenticatedAppShell({ children }: UnauthenticatedAppShellProps) {
  return (
    <View className="flex-1 items-center justify-center bg-surface px-6">
      <View className="w-full max-w-md">{children}</View>
    </View>
  )
}
