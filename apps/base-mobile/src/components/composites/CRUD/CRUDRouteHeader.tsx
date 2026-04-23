import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Icon } from '../../base'
import { materialColors } from '../../../theme/material'

type CRUDRouteHeaderProps = {
  title: string
  onBack?: () => void
  backLabel?: string
}

export function CRUDRouteHeader({ title, onBack, backLabel = 'Back' }: CRUDRouteHeaderProps) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-left-line" size={18} color={materialColors.onSurface} />
          <Text style={styles.backLabel}>{backLabel}</Text>
        </Pressable>
      ) : null}
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: materialColors.surfaceContainer,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
})
