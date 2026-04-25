import RemixIcon from 'react-native-remix-icon'
import type { StyleProp, TextStyle } from 'react-native'
import { materialColors } from '../../theme/material'
import remixiconTags from './remixicon-tags'

type IconName = (typeof remixiconTags)[number]
type IconSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'

type IconProps = {
  name: IconName | string
  fill?: boolean
  size?: IconSize | number
  color?: string
  style?: StyleProp<TextStyle>
  accessibilityLabel?: string
}

const boxSizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
}

function resolveIconSize(size: IconProps['size']): number {
  if (typeof size === 'number') return size
  return boxSizeMap[size || 'xl']
}

export function Icon({ name, fill = false, size = 'xl', color = materialColors.onSurfaceVariant, style, accessibilityLabel }: IconProps) {
  return (
    <RemixIcon
      name={`${name}-${fill ? 'fill' : 'line'}` as any}
      size={resolveIconSize(size)}
      color={color}
      style={style as any}
      accessibilityLabel={accessibilityLabel}
      fallback={null}
    />
  )
}
