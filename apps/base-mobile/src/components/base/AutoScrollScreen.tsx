import { useMemo, type ReactNode } from 'react'
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { screenPaddingBottom, screenPaddingHorizontal, screenPaddingTop } from '../../theme/layout'
import { materialColors } from '../../theme/material'

type AutoScrollScreenProps = {
  children: ReactNode
  contentContainerStyle?: StyleProp<ViewStyle>
  includeTopInset?: boolean
}

export function AutoScrollScreen({ children, contentContainerStyle, includeTopInset = true }: AutoScrollScreenProps) {
  const insets = useSafeAreaInsets()
  const mergedContentContainerStyle = useMemo<StyleProp<ViewStyle>>(
    () => [
      styles.contentContainer,
      {
        paddingTop: (includeTopInset ? insets.top : 0) + screenPaddingTop,
        paddingBottom: screenPaddingBottom,
        paddingHorizontal: screenPaddingHorizontal,
      },
      contentContainerStyle,
    ],
    [contentContainerStyle, includeTopInset, insets.top]
  )

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={mergedContentContainerStyle}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: materialColors.background,
  },
  contentContainer: {
    flexGrow: 1,
  },
})
