import { useMemo, type ReactNode } from 'react'
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { screenPaddingBottom, screenPaddingHorizontal, screenPaddingTop } from '../../theme/layout'
import { materialColors } from '../../theme/material'
import { useActionControlsBottomInset } from './ActionControls'

export type AppScreenProps = {
  children: ReactNode
  contentContainerStyle?: StyleProp<ViewStyle>
  includeTopInset?: boolean
  scrollable?: boolean
  includeHorizontalPadding?: boolean
  includeBottomPadding?: boolean
  keyboardShouldPersistTaps?: 'never' | 'always' | 'handled'
}

export type AppScreenOptions = Partial<
  Pick<
    AppScreenProps,
    'includeTopInset' | 'scrollable' | 'includeHorizontalPadding' | 'includeBottomPadding' | 'keyboardShouldPersistTaps'
  >
>

export function AppScreen({
  children,
  contentContainerStyle,
  includeTopInset = true,
  scrollable = true,
  includeHorizontalPadding = true,
  includeBottomPadding = true,
  keyboardShouldPersistTaps = 'handled',
}: AppScreenProps) {
  const insets = useSafeAreaInsets()
  const actionControlsBottomInset = useActionControlsBottomInset()
  const mergedContentContainerStyle = useMemo<StyleProp<ViewStyle>>(
    () => [
      scrollable ? { flexGrow: 1 } : { flex: 1 },
      {
        paddingTop: (includeTopInset ? insets.top : 0) + screenPaddingTop,
        paddingBottom: (includeBottomPadding ? screenPaddingBottom : 0) + actionControlsBottomInset,
        paddingHorizontal: includeHorizontalPadding ? screenPaddingHorizontal : 0,
      },
      contentContainerStyle,
    ],
    [
      actionControlsBottomInset,
      contentContainerStyle,
      includeBottomPadding,
      includeHorizontalPadding,
      includeTopInset,
      insets.top,
      scrollable,
    ]
  )

  if (!scrollable) {
    return (
      <View testID="app-screen-view" className="flex-1" style={[{ backgroundColor: materialColors.background }, mergedContentContainerStyle]}>
        {children}
      </View>
    )
  }

  return (
    <ScrollView
      testID="app-screen-scroll-view"
      className="flex-1"
      style={{ backgroundColor: materialColors.background }}
      contentContainerStyle={mergedContentContainerStyle}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
    >
      {children}
    </ScrollView>
  )
}
