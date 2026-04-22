import type { ReactNode } from 'react'
import { ScrollView, type StyleProp, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getAuthenticatedContentBottomInset } from '../../lib/authenticated-layout'

type AuthenticatedContentProps = {
  children: ReactNode
  centered?: boolean
  horizontalPadding?: number
  topPadding?: number
  contentContainerStyle?: StyleProp<ViewStyle>
}

export function AuthenticatedContent({
  children,
  centered = false,
  horizontalPadding = 16,
  topPadding,
  contentContainerStyle,
}: AuthenticatedContentProps) {
  const insets = useSafeAreaInsets()
  const resolvedTopPadding = topPadding ?? insets.top + 12
  const resolvedBottomInset = getAuthenticatedContentBottomInset(insets.bottom)

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        {
          flexGrow: 1,
          paddingHorizontal: horizontalPadding,
          paddingTop: resolvedTopPadding,
          paddingBottom: resolvedBottomInset,
        },
        centered
          ? {
              justifyContent: 'center',
              alignItems: 'center',
            }
          : null,
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      alwaysBounceVertical
    >
      {children}
    </ScrollView>
  )
}
