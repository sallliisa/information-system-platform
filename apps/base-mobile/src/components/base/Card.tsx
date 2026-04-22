import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import {
  Pressable,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { materialColors } from '../../theme/material'

type CardType = 'filled' | 'elevated' | 'outlined'
type CardColorRole =
  | 'surface'
  | 'surfaceContainerLowest'
  | 'surfaceContainerLow'
  | 'surfaceContainer'
  | 'surfaceContainerHigh'
  | 'surfaceContainerHighest'
  | 'primaryContainer'
  | 'secondaryContainer'
  | 'tertiaryContainer'
  | 'errorContainer'

type CardProps = Omit<PressableProps, 'children' | 'style'> & {
  type?: CardType
  color?: CardColorRole
  containerRole?: CardColorRole
  disabled?: boolean
  contentPadding?: number
  style?: StyleProp<ViewStyle>
  children: ReactNode
}

const COLOR_ROLE_MAP: Record<CardColorRole, string> = {
  surface: materialColors.surface,
  surfaceContainerLowest: materialColors.surfaceContainerLowest,
  surfaceContainerLow: materialColors.surfaceContainerLow,
  surfaceContainer: materialColors.surfaceContainer,
  surfaceContainerHigh: materialColors.surfaceContainerHigh,
  surfaceContainerHighest: materialColors.surfaceContainerHighest,
  primaryContainer: materialColors.primaryContainer,
  secondaryContainer: materialColors.secondaryContainer,
  tertiaryContainer: materialColors.tertiaryContainer,
  errorContainer: materialColors.errorContainer,
}

function resolveColor(color?: CardColorRole, containerRole?: CardColorRole) {
  const role = color ?? containerRole ?? 'surfaceContainer'
  return COLOR_ROLE_MAP[role]
}

function resolveElevationStyle(type: CardType): ViewStyle {
  if (type !== 'elevated') return { elevation: 0 }

  return {
    elevation: 1,
    shadowColor: materialColors.shadow,
    shadowOpacity: 0.28,
    shadowRadius: 1,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  }
}

export function Card({
  type = 'filled',
  color,
  containerRole,
  disabled = false,
  contentPadding = 16,
  style,
  children,
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}: CardProps) {
  const [isPressed, setIsPressed] = useState(false)
  const isInteractive = typeof onPress === 'function'

  const cardStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: resolveColor(color, containerRole),
      borderRadius: 12,
      padding: contentPadding,
      overflow: 'hidden',
      ...(type === 'outlined'
        ? {
            borderWidth: 1,
            borderColor: materialColors.outlineVariant,
          }
        : null),
      ...resolveElevationStyle(type),
    }),
    [color, containerRole, contentPadding, type]
  )

  const handlePressIn = (event: GestureResponderEvent) => {
    if (!disabled) {
      setIsPressed(true)
    }
    onPressIn?.(event)
  }

  const handlePressOut = (event: GestureResponderEvent) => {
    if (isPressed) {
      setIsPressed(false)
    }
    onPressOut?.(event)
  }

  const content = (
    <>
      {children}
      {isInteractive && isPressed && !disabled ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: materialColors.onSurface,
            opacity: 0.1,
          }}
        />
      ) : null}
      {disabled ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: materialColors.onSurface,
            opacity: 0.12,
          }}
        />
      ) : null}
    </>
  )

  if (!isInteractive) {
    return (
      <View style={[cardStyle, style]}>
        {content}
      </View>
    )
  }

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[cardStyle, style]}
      {...rest}
    >
      {content}
    </Pressable>
  )
}
