import RemixIcon from 'react-native-remix-icon'
import type { StyleProp, TextStyle } from 'react-native'
import { materialColors } from '../../theme/material'

type IconProps = {
  name: string
  size?: number
  color?: string
  style?: StyleProp<TextStyle>
  accessibilityLabel?: string
}

export function Icon({ name, size = 20, color = materialColors.onSurfaceVariant, style, accessibilityLabel }: IconProps) {
  return (
    <RemixIcon
      name={name as any}
      size={size}
      color={color}
      style={style as any}
      accessibilityLabel={accessibilityLabel}
      fallback={null}
    />
  )
}
