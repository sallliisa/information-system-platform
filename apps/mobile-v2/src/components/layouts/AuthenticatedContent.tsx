import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, type ScrollViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getAuthenticatedContentBottomInset } from '../../lib/authenticated-layout'
import { materialColors } from '../../theme/material'

type AuthenticatedContentProps = ScrollViewProps & {
  children: ReactNode
}

export function AuthenticatedContent({ children, style, contentContainerStyle, ...props }: AuthenticatedContentProps) {
  const insets = useSafeAreaInsets()
  const bottomInset = getAuthenticatedContentBottomInset(insets.bottom)

  return (
    <ScrollView
      style={[styles.root, style]}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomInset }, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: materialColors.background,
  },
  contentContainer: {
    flexGrow: 1,
  },
})
