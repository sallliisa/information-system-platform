import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { Button, Icon } from '../../base'
import { materialColors } from '../../../theme/material'

type CRUDRouteHeaderProps = {
  title: string
  onBack?: () => void
  backLabel?: string
  actions?: ReactNode
}

export function CRUDRouteHeader({ title, onBack, backLabel = 'Back', actions }: CRUDRouteHeaderProps) {
  return (
    <View className="flex-row items-center gap-2 min-h-[52px]">
      {onBack ? (
        <Button
          size='square'
          variant='icon'
          onPress={onBack}
          aria-label={backLabel}
        >
          <Icon name="arrow-left" size={18} color={materialColors.onSurface} />
        </Button>
      ) : null}
      <Text numberOfLines={1} className="flex-1 text-2xl font-bold" style={{ color: materialColors.onSurface }}>
        {title}
      </Text>
      <View className="items-end justify-center">
        {actions}
      </View>
    </View>
  )
}
