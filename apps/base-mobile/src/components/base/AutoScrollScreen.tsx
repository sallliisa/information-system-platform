import { useMemo, type ReactNode } from 'react'
import { ScrollView, type StyleProp, type ViewStyle } from 'react-native'
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
      { flexGrow: 1 },
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
    <ScrollView className="flex-1" style={{ backgroundColor: materialColors.background }} contentContainerStyle={mergedContentContainerStyle} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  )
}
