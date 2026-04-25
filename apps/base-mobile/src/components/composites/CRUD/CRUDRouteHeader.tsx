import { Pressable, Text, View } from 'react-native'
import { Button, Icon } from '../../base'
import { materialColors } from '../../../theme/material'

type CRUDRouteHeaderProps = {
  title: string
  onBack?: () => void
  backLabel?: string
}

export function CRUDRouteHeader({ title, onBack, backLabel = 'Back' }: CRUDRouteHeaderProps) {
  return (
    <View className="gap-2 flex flex-row items-center">
      {onBack ? (
        // <Pressable className="self-start min-h-10 rounded-[10px] px-3 flex-row items-center gap-1.5" style={{ backgroundColor: materialColors.surfaceContainer }} onPress={onBack}>
        //   <Icon name="arrow-left" size={18} color={materialColors.onSurface} />
        //   <Text className="text-[13px] font-bold" style={{ color: materialColors.onSurface }}>{backLabel}</Text>
        // </Pressable>
        <Button
          size='square'
          variant='icon'
          onPress={onBack}
        >
          <Icon name="arrow-left" size={18} color={materialColors.onSurface} />
        </Button>
      ) : null}
      <Text className="text-2xl font-bold" style={{ color: materialColors.onSurface }}>{title}</Text>
    </View>
  )
}
