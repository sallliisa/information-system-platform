import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import {
  Pressable,
  Text,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { materialColors } from '../../theme/material'

type ButtonVariant = 'filled' | 'outlined' | 'tonal' | 'icon'
type ButtonColor = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'error' | 'info' | 'success'
type ButtonSize = 'square' | 'full'

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  variant?: ButtonVariant
  color?: ButtonColor
  size?: ButtonSize
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  className?: string
  children?: ReactNode
}

type ColorRole = {
  solidBackground: string
  solidContent: string
  containerBackground: string
  containerContent: string
  outlinedContent: string
}

const DISABLED_BACKGROUND = 'rgba(0, 0, 0, 0.12)'
const DISABLED_CONTENT = 'rgba(0, 0, 0, 0.38)'

const SIZE_STYLES: Record<ButtonSize, ViewStyle> = {
  square: {
    width: 52,
    height: 52,
    borderRadius: 999,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  full: {
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
}

const COLOR_ROLES: Record<ButtonColor, ColorRole> = {
  primary: {
    solidBackground: materialColors.primary,
    solidContent: materialColors.onPrimary,
    containerBackground: materialColors.primaryContainer,
    containerContent: materialColors.onPrimaryContainer,
    outlinedContent: materialColors.primary,
  },
  secondary: {
    solidBackground: materialColors.secondary,
    solidContent: materialColors.onSecondary,
    containerBackground: materialColors.secondaryContainer,
    containerContent: materialColors.onSecondaryContainer,
    outlinedContent: materialColors.onSurface,
  },
  tertiary: {
    solidBackground: materialColors.tertiary,
    solidContent: materialColors.onTertiary,
    containerBackground: materialColors.tertiaryContainer,
    containerContent: materialColors.onTertiaryContainer,
    outlinedContent: materialColors.tertiary,
  },
  warning: {
    solidBackground: materialColors.error,
    solidContent: materialColors.onError,
    containerBackground: materialColors.errorContainer,
    containerContent: materialColors.onErrorContainer,
    outlinedContent: materialColors.error,
  },
  error: {
    solidBackground: materialColors.error,
    solidContent: materialColors.onError,
    containerBackground: materialColors.errorContainer,
    containerContent: materialColors.onErrorContainer,
    outlinedContent: materialColors.error,
  },
  info: {
    solidBackground: materialColors.primaryContainer,
    solidContent: materialColors.onPrimaryContainer,
    containerBackground: materialColors.secondaryContainer,
    containerContent: materialColors.onSecondaryContainer,
    outlinedContent: materialColors.primary,
  },
  success: {
    solidBackground: materialColors.secondaryContainer,
    solidContent: materialColors.onSecondaryContainer,
    containerBackground: materialColors.tertiaryContainer,
    containerContent: materialColors.onTertiaryContainer,
    outlinedContent: materialColors.secondary,
  },
}

function getVariantStyle(variant: ButtonVariant, colorRole: ColorRole, color: ButtonColor): ViewStyle {
  if (variant === 'filled') {
    return {
      backgroundColor: colorRole.solidBackground,
    }
  }

  if (variant === 'tonal') {
    return {
      backgroundColor: colorRole.containerBackground,
    }
  }

  if (variant === 'outlined') {
    if (color === 'secondary') {
      return {
        backgroundColor: materialColors.surfaceContainer,
        borderColor: materialColors.outlineVariant,
        borderWidth: 1,
      }
    }

    return {
      backgroundColor: 'transparent',
      borderColor: materialColors.outlineVariant,
      borderWidth: 1,
    }
  }

  return {
    backgroundColor: 'transparent',
  }
}

function getContentColor(variant: ButtonVariant, colorRole: ColorRole): string {
  if (variant === 'filled') return colorRole.solidContent
  if (variant === 'tonal') return colorRole.containerContent
  if (variant === 'outlined') return colorRole.outlinedContent
  return colorRole.outlinedContent
}

function shouldWrapWithText(children: ReactNode): children is string | number {
  return typeof children === 'string' || typeof children === 'number'
}

export function Button({
  variant = 'filled',
  color = 'primary',
  size = 'full',
  disabled = false,
  className,
  style,
  children,
  ...rest
}: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const colorRole = COLOR_ROLES[color]
  const contentColor = disabled ? DISABLED_CONTENT : getContentColor(variant, colorRole)
  const pressableClassName = useMemo(() => {
    if (!className) return undefined
    const trimmed = className.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }, [className])
  const { onPressIn, onPressOut, ...pressableProps } = rest

  const content = shouldWrapWithText(children) ? (
    <Text style={{ color: contentColor, fontWeight: '600' }}>{children}</Text>
  ) : (
    children
  )

  const handlePressIn = (event: GestureResponderEvent) => {
    if (!disabled) setIsPressed(true)
    onPressIn?.(event)
  }

  const handlePressOut = (event: GestureResponderEvent) => {
    if (isPressed) setIsPressed(false)
    onPressOut?.(event)
  }

  return (
    <Pressable
      disabled={disabled}
      {...(pressableClassName ? { className: pressableClassName } : {})}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        },
        SIZE_STYLES[size],
        getVariantStyle(variant, colorRole, color),
        disabled
          ? {
              backgroundColor: DISABLED_BACKGROUND,
              borderColor: DISABLED_BACKGROUND,
            }
          : null,
        !disabled && isPressed ? { opacity: 0.92 } : null,
        style,
      ]}
      {...pressableProps}
    >
      {content}
    </Pressable>
  )
}
