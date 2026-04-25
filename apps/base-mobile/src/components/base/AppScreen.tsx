import { useMemo, type ReactNode } from 'react'
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { screenPaddingBottom, screenPaddingHorizontal, screenPaddingTop } from '../../theme/layout'
import { materialColors } from '../../theme/material'
import { useActionControlsBottomInset } from './ActionControls'

export type AppScreenEdge = 'top' | 'right' | 'bottom' | 'left'

type AppScreenEdgeValues<T> = Record<AppScreenEdge, T>

export type AppScreenProps = {
  children: ReactNode
  contentContainerStyle?: StyleProp<ViewStyle>
  options?: AppScreenOptions
}

export type AppScreenOptions = {
  layout?: {
    scrollable?: boolean
    backgroundColor?: string
  }
  safeArea?: Partial<AppScreenEdgeValues<boolean>>
  padding?: Partial<AppScreenEdgeValues<number>>
  insets?: {
    actionControlsBottom?: boolean
    extra?: Partial<AppScreenEdgeValues<number>>
  }
  scrollView?: {
    keyboardShouldPersistTaps?: 'never' | 'always' | 'handled'
    keyboardDismissMode?: 'none' | 'on-drag' | 'interactive'
    bounces?: boolean
    showsVerticalScrollIndicator?: boolean
    showsHorizontalScrollIndicator?: boolean
  }
}

export type ResolvedAppScreenOptions = {
  layout: {
    scrollable: boolean
    backgroundColor: string
  }
  safeArea: AppScreenEdgeValues<boolean>
  padding: AppScreenEdgeValues<number>
  insets: {
    actionControlsBottom: boolean
    extra: AppScreenEdgeValues<number>
  }
  scrollView: {
    keyboardShouldPersistTaps: 'never' | 'always' | 'handled'
    keyboardDismissMode: 'none' | 'on-drag' | 'interactive'
    bounces: boolean
    showsVerticalScrollIndicator: boolean
    showsHorizontalScrollIndicator: boolean
  }
}

const APP_SCREEN_EDGES: AppScreenEdge[] = ['top', 'right', 'bottom', 'left']

export const APP_SCREEN_DEFAULT_OPTIONS: ResolvedAppScreenOptions = {
  layout: {
    scrollable: true,
    backgroundColor: materialColors.background,
  },
  safeArea: {
    top: true,
    right: false,
    bottom: false,
    left: false,
  },
  padding: {
    top: screenPaddingTop,
    right: screenPaddingHorizontal,
    bottom: screenPaddingBottom,
    left: screenPaddingHorizontal,
  },
  insets: {
    actionControlsBottom: false,
    extra: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
  scrollView: {
    keyboardShouldPersistTaps: 'handled',
    keyboardDismissMode: 'none',
    bounces: true,
    showsVerticalScrollIndicator: true,
    showsHorizontalScrollIndicator: true,
  },
}

function mergeEdgeValues<T>(
  base: Partial<AppScreenEdgeValues<T>> | undefined,
  override: Partial<AppScreenEdgeValues<T>> | undefined
): Partial<AppScreenEdgeValues<T>> | undefined {
  if (!base && !override) return undefined
  return {
    ...(base || {}),
    ...(override || {}),
  }
}

export function mergeAppScreenOptions(
  base: AppScreenOptions | undefined,
  override: AppScreenOptions | undefined
): AppScreenOptions {
  if (!base && !override) return {}
  return {
    layout: {
      ...(base?.layout || {}),
      ...(override?.layout || {}),
    },
    safeArea: mergeEdgeValues(base?.safeArea, override?.safeArea),
    padding: mergeEdgeValues(base?.padding, override?.padding),
    insets: {
      ...(base?.insets || {}),
      ...(override?.insets || {}),
      extra: mergeEdgeValues(base?.insets?.extra, override?.insets?.extra),
    },
    scrollView: {
      ...(base?.scrollView || {}),
      ...(override?.scrollView || {}),
    },
  }
}

function cloneResolvedOptions(options: ResolvedAppScreenOptions): ResolvedAppScreenOptions {
  return {
    layout: { ...options.layout },
    safeArea: { ...options.safeArea },
    padding: { ...options.padding },
    insets: {
      actionControlsBottom: options.insets.actionControlsBottom,
      extra: { ...options.insets.extra },
    },
    scrollView: { ...options.scrollView },
  }
}

export function resolveAppScreenOptions(...layers: Array<AppScreenOptions | undefined>): ResolvedAppScreenOptions {
  const resolved = cloneResolvedOptions(APP_SCREEN_DEFAULT_OPTIONS)

  for (const layer of layers) {
    if (!layer) continue

    if (layer.layout?.scrollable !== undefined) resolved.layout.scrollable = layer.layout.scrollable
    if (layer.layout?.backgroundColor !== undefined) resolved.layout.backgroundColor = layer.layout.backgroundColor

    for (const edge of APP_SCREEN_EDGES) {
      const safeAreaValue = layer.safeArea?.[edge]
      if (safeAreaValue !== undefined) resolved.safeArea[edge] = safeAreaValue

      const paddingValue = layer.padding?.[edge]
      if (paddingValue !== undefined) resolved.padding[edge] = paddingValue

      const extraInsetValue = layer.insets?.extra?.[edge]
      if (extraInsetValue !== undefined) resolved.insets.extra[edge] = extraInsetValue
    }

    if (layer.insets?.actionControlsBottom !== undefined) {
      resolved.insets.actionControlsBottom = layer.insets.actionControlsBottom
    }

    if (layer.scrollView?.keyboardShouldPersistTaps !== undefined) {
      resolved.scrollView.keyboardShouldPersistTaps = layer.scrollView.keyboardShouldPersistTaps
    }
    if (layer.scrollView?.keyboardDismissMode !== undefined) {
      resolved.scrollView.keyboardDismissMode = layer.scrollView.keyboardDismissMode
    }
    if (layer.scrollView?.bounces !== undefined) {
      resolved.scrollView.bounces = layer.scrollView.bounces
    }
    if (layer.scrollView?.showsVerticalScrollIndicator !== undefined) {
      resolved.scrollView.showsVerticalScrollIndicator = layer.scrollView.showsVerticalScrollIndicator
    }
    if (layer.scrollView?.showsHorizontalScrollIndicator !== undefined) {
      resolved.scrollView.showsHorizontalScrollIndicator = layer.scrollView.showsHorizontalScrollIndicator
    }
  }

  return resolved
}

function deepEqualUnknown(left: unknown, right: unknown): boolean {
  if (left === right) return true
  if (typeof left !== typeof right) return false
  if (left === null || right === null) return left === right

  if (Array.isArray(left) || Array.isArray(right)) return false

  if (typeof left === 'object' && typeof right === 'object') {
    const leftRecord = left as Record<string, unknown>
    const rightRecord = right as Record<string, unknown>
    const leftKeys = Object.keys(leftRecord)
    const rightKeys = Object.keys(rightRecord)
    if (leftKeys.length !== rightKeys.length) return false

    for (const key of leftKeys) {
      if (!Object.prototype.hasOwnProperty.call(rightRecord, key)) return false
      if (!deepEqualUnknown(leftRecord[key], rightRecord[key])) return false
    }

    return true
  }

  return false
}

export function areAppScreenOptionsEqual(
  left: AppScreenOptions | undefined,
  right: AppScreenOptions | undefined
) {
  return deepEqualUnknown(left || {}, right || {})
}

export function resolveEdgePadding(
  options: ResolvedAppScreenOptions,
  safeAreaInsets: AppScreenEdgeValues<number>,
  actionControlsBottomInset: number
) {
  return {
    top:
      options.padding.top +
      (options.safeArea.top ? safeAreaInsets.top : 0) +
      options.insets.extra.top,
    right:
      options.padding.right +
      (options.safeArea.right ? safeAreaInsets.right : 0) +
      options.insets.extra.right,
    bottom:
      options.padding.bottom +
      (options.safeArea.bottom ? safeAreaInsets.bottom : 0) +
      options.insets.extra.bottom +
      (options.insets.actionControlsBottom ? actionControlsBottomInset : 0),
    left:
      options.padding.left +
      (options.safeArea.left ? safeAreaInsets.left : 0) +
      options.insets.extra.left,
  }
}

export function AppScreen({
  children,
  contentContainerStyle,
  options,
}: AppScreenProps) {
  const insets = useSafeAreaInsets()
  const actionControlsBottomInset = useActionControlsBottomInset()
  const resolvedOptions = useMemo(() => resolveAppScreenOptions(options), [options])
  const edgePadding = useMemo(
    () =>
      resolveEdgePadding(
        resolvedOptions,
        {
          top: insets.top,
          right: insets.right,
          bottom: insets.bottom,
          left: insets.left,
        },
        actionControlsBottomInset
      ),
    [actionControlsBottomInset, insets.bottom, insets.left, insets.right, insets.top, resolvedOptions]
  )
  const mergedContentContainerStyle = useMemo<StyleProp<ViewStyle>>(
    () => [
      resolvedOptions.layout.scrollable ? { flexGrow: 1 } : { flex: 1 },
      {
        paddingTop: edgePadding.top,
        paddingRight: edgePadding.right,
        paddingBottom: edgePadding.bottom,
        paddingLeft: edgePadding.left,
      },
      contentContainerStyle,
    ],
    [
      contentContainerStyle,
      edgePadding.bottom,
      edgePadding.left,
      edgePadding.right,
      edgePadding.top,
      resolvedOptions.layout.scrollable,
    ]
  )

  if (!resolvedOptions.layout.scrollable) {
    return (
      <View
        testID="app-screen-view"
        className="flex-1"
        style={[{ backgroundColor: resolvedOptions.layout.backgroundColor }, mergedContentContainerStyle]}
      >
        {children}
      </View>
    )
  }

  return (
    <ScrollView
      testID="app-screen-scroll-view"
      className="flex-1"
      style={{ backgroundColor: resolvedOptions.layout.backgroundColor }}
      contentContainerStyle={mergedContentContainerStyle}
      keyboardShouldPersistTaps={resolvedOptions.scrollView.keyboardShouldPersistTaps}
      keyboardDismissMode={resolvedOptions.scrollView.keyboardDismissMode}
      bounces={resolvedOptions.scrollView.bounces}
      showsVerticalScrollIndicator={resolvedOptions.scrollView.showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={resolvedOptions.scrollView.showsHorizontalScrollIndicator}
    >
      {children}
    </ScrollView>
  )
}
